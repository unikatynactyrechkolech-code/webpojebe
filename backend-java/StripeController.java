package com.webpojede.controller;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

/**
 * Stripe Payment Controller
 * 
 * Endpoint pro vytvoření PaymentIntent pro Stripe Custom Checkout.
 * 
 * @author WebPojede
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "https://webpojede.cz"})
public class StripeController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Vytvoří PaymentIntent pro platbu.
     * 
     * @param request PaymentRequest obsahující amount (v haléřích) a currency
     * @return JSON s clientSecret pro frontend
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentRequest request) {
        try {
            // Validace vstupů
            if (request.getAmount() == null || request.getAmount() < 100) {
                return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Částka musí být minimálně 100 haléřů (1 Kč)"));
            }

            if (request.getCurrency() == null || request.getCurrency().isBlank()) {
                request.setCurrency("czk"); // Default měna
            }

            // Vytvoření PaymentIntent
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(request.getAmount())
                .setCurrency(request.getCurrency().toLowerCase())
                .setDescription("WebPojede - " + (request.getDescription() != null ? request.getDescription() : "Platba za služby"))
                // Automatická podpora platebních metod (karty, Apple Pay, Google Pay)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                // Metadata pro interní účely
                .putMetadata("source", "webpojede-checkout")
                .putMetadata("product", request.getProductId() != null ? request.getProductId() : "web-standard")
                .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Vrátíme clientSecret pro frontend
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("paymentIntentId", paymentIntent.getId());

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            // Logování chyby
            System.err.println("Stripe error: " + e.getMessage());
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Nepodařilo se vytvořit platbu");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
        }
    }

    /**
     * Endpoint pro ověření stavu platby (volitelné).
     */
    @GetMapping("/payment-status/{paymentIntentId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", paymentIntent.getId());
            response.put("status", paymentIntent.getStatus());
            response.put("amount", paymentIntent.getAmount());
            response.put("currency", paymentIntent.getCurrency());
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Platba nenalezena"));
        }
    }

    /**
     * Request DTO pro vytvoření platby.
     */
    public static class PaymentRequest {
        private Long amount;      // Částka v haléřích (nejmenší jednotka měny)
        private String currency;  // Měna (czk, eur, usd...)
        private String description;
        private String productId;

        // Getters & Setters
        public Long getAmount() { return amount; }
        public void setAmount(Long amount) { this.amount = amount; }
        
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getProductId() { return productId; }
        public void setProductId(String productId) { this.productId = productId; }
    }
}
