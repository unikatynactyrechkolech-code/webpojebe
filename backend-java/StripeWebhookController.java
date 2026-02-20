package com.webpojede.controller;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.*;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Stripe Webhook Controller
 * 
 * Endpoint pro zpracování Stripe webhooků.
 * Nastavení v Stripe Dashboard: https://dashboard.stripe.com/webhooks
 * 
 * @author WebPojede
 */
@RestController
@RequestMapping("/api/webhooks")
public class StripeWebhookController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    /**
     * Zpracuje Stripe webhook události.
     * 
     * URL pro nastavení v Stripe: https://yourdomain.com/api/webhooks/stripe
     * 
     * @param payload Raw JSON payload
     * @param sigHeader Stripe-Signature header
     * @return HTTP 200 pro potvrzení přijetí
     */
    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        Event event;
        
        try {
            // Ověření podpisu webhooku - KRITICKÉ pro bezpečnost!
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            System.err.println("⚠️ Webhook signature verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // Zpracování události podle typu
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = null;
        
        if (dataObjectDeserializer.getObject().isPresent()) {
            stripeObject = dataObjectDeserializer.getObject().get();
        } else {
            System.err.println("⚠️ Unable to deserialize event data");
            return ResponseEntity.ok("Event received but not processed");
        }

        // Zpracování různých typů událostí
        switch (event.getType()) {
            case "payment_intent.succeeded":
                PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
                handlePaymentSuccess(paymentIntent);
                break;
                
            case "payment_intent.payment_failed":
                PaymentIntent failedPayment = (PaymentIntent) stripeObject;
                handlePaymentFailure(failedPayment);
                break;
                
            case "charge.refunded":
                Charge refundedCharge = (Charge) stripeObject;
                handleRefund(refundedCharge);
                break;
                
            case "customer.created":
                Customer customer = (Customer) stripeObject;
                handleNewCustomer(customer);
                break;
                
            default:
                System.out.println("ℹ️ Unhandled event type: " + event.getType());
        }

        return ResponseEntity.ok("Webhook processed");
    }

    /**
     * Zpracování úspěšné platby.
     */
    private void handlePaymentSuccess(PaymentIntent paymentIntent) {
        System.out.println("✅ Payment succeeded!");
        System.out.println("   Payment Intent ID: " + paymentIntent.getId());
        System.out.println("   Amount: " + paymentIntent.getAmount() + " " + paymentIntent.getCurrency());
        System.out.println("   Metadata: " + paymentIntent.getMetadata());
        
        // TODO: Implementuj vlastní logiku
        // - Ulož platbu do databáze
        // - Odešli potvrzovací e-mail zákazníkovi
        // - Aktivuj službu/produkt
        // - Notifikuj tým (Slack, e-mail...)
        
        // Příklad:
        // orderService.markAsPaid(paymentIntent.getMetadata().get("orderId"));
        // emailService.sendPaymentConfirmation(paymentIntent);
    }

    /**
     * Zpracování neúspěšné platby.
     */
    private void handlePaymentFailure(PaymentIntent paymentIntent) {
        System.out.println("❌ Payment failed!");
        System.out.println("   Payment Intent ID: " + paymentIntent.getId());
        System.out.println("   Last error: " + paymentIntent.getLastPaymentError());
        
        // TODO: Implementuj vlastní logiku
        // - Zaloguj chybu
        // - Notifikuj zákazníka (e-mail)
        // - Případně nabídni alternativní platební metodu
    }

    /**
     * Zpracování refundace.
     */
    private void handleRefund(Charge charge) {
        System.out.println("💸 Charge refunded!");
        System.out.println("   Charge ID: " + charge.getId());
        System.out.println("   Amount refunded: " + charge.getAmountRefunded());
        
        // TODO: Implementuj vlastní logiku
        // - Aktualizuj stav objednávky v databázi
        // - Odešli e-mail zákazníkovi
        // - Deaktivuj službu pokud je to třeba
    }

    /**
     * Zpracování nového zákazníka.
     */
    private void handleNewCustomer(Customer customer) {
        System.out.println("👤 New customer created!");
        System.out.println("   Customer ID: " + customer.getId());
        System.out.println("   Email: " + customer.getEmail());
        
        // TODO: Ulož zákazníka do vlastní databáze
    }
}
