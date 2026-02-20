package com.webpojede.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Invoice;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Subscription;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerListParams;
import com.stripe.param.SubscriptionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

/**
 * Stripe Subscription Controller
 * 
 * Endpoint pro vytvoření měsíčního předplatného.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://webpojede.cz"})
public class SubscriptionController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Vytvoří nové předplatné.
     * 
     * @param request SubscriptionRequest s priceId a email
     * @return clientSecret pro dokončení platby na frontendu
     */
    @PostMapping("/create-subscription")
    public ResponseEntity<?> createSubscription(@RequestBody SubscriptionRequest request) {
        try {
            // Validace
            if (request.getPriceId() == null || request.getPriceId().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chybí Price ID"));
            }

            // 1. Najdi nebo vytvoř zákazníka
            String email = request.getEmail() != null && !request.getEmail().isBlank() 
                ? request.getEmail() 
                : "customer_" + System.currentTimeMillis() + "@webpojede.cz";
            
            Customer customer = findOrCreateCustomer(email);

            // 2. Vytvoř subscription s incomplete status
            SubscriptionCreateParams subscriptionParams = SubscriptionCreateParams.builder()
                .setCustomer(customer.getId())
                .addItem(SubscriptionCreateParams.Item.builder()
                    .setPrice(request.getPriceId())
                    .build())
                .setPaymentBehavior(SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE)
                .setPaymentSettings(SubscriptionCreateParams.PaymentSettings.builder()
                    .setSaveDefaultPaymentMethod(
                        SubscriptionCreateParams.PaymentSettings.SaveDefaultPaymentMethod.ON_SUBSCRIPTION)
                    .build())
                .addExpand("latest_invoice.payment_intent")
                .putMetadata("source", "webpojede-checkout")
                .build();

            Subscription subscription = Subscription.create(subscriptionParams);

            // 3. Získej clientSecret z payment_intent
            Invoice invoice = subscription.getLatestInvoiceObject();
            PaymentIntent paymentIntent = invoice.getPaymentIntentObject();

            if (paymentIntent == null || paymentIntent.getClientSecret() == null) {
                throw new RuntimeException("Nepodařilo se získat platební údaje");
            }

            // 4. Vrať response
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("subscriptionId", subscription.getId());
            response.put("customerId", customer.getId());

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            System.err.println("Stripe error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Chyba při vytváření předplatného", "message", e.getMessage()));
        }
    }

    /**
     * Najde existujícího zákazníka nebo vytvoří nového.
     */
    private Customer findOrCreateCustomer(String email) throws StripeException {
        // Hledej existujícího
        CustomerListParams listParams = CustomerListParams.builder()
            .setEmail(email)
            .setLimit(1L)
            .build();
        
        var customers = Customer.list(listParams);
        
        if (!customers.getData().isEmpty()) {
            return customers.getData().get(0);
        }

        // Vytvoř nového
        CustomerCreateParams createParams = CustomerCreateParams.builder()
            .setEmail(email)
            .putMetadata("source", "webpojede-checkout")
            .build();

        return Customer.create(createParams);
    }

    /**
     * Endpoint pro zrušení předplatného (volitelné).
     */
    @PostMapping("/cancel-subscription")
    public ResponseEntity<?> cancelSubscription(@RequestBody Map<String, String> request) {
        try {
            String subscriptionId = request.get("subscriptionId");
            
            if (subscriptionId == null || subscriptionId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Chybí ID předplatného"));
            }

            Subscription subscription = Subscription.retrieve(subscriptionId);
            Subscription canceledSubscription = subscription.cancel();

            return ResponseEntity.ok(Map.of(
                "status", canceledSubscription.getStatus(),
                "canceledAt", canceledSubscription.getCanceledAt()
            ));

        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Nepodařilo se zrušit předplatné"));
        }
    }

    /**
     * Request DTO
     */
    public static class SubscriptionRequest {
        private String priceId;
        private String email;

        public String getPriceId() { return priceId; }
        public void setPriceId(String priceId) { this.priceId = priceId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
}
