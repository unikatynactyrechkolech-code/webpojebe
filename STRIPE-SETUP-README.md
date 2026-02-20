# ================================================
# STRIPE CUSTOM CHECKOUT - SETUP INSTRUKCE
# ================================================

## 1. PREREQUISITES (Co potřebuješ nainstalovat)

### Java Backend (pom.xml)
```xml
<!-- Přidej do <dependencies> -->
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>24.18.0</version>
</dependency>
```

### Next.js Frontend (pokud migruješ z HTML)
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
# nebo
yarn add @stripe/stripe-js @stripe/react-stripe-js
# nebo
pnpm add @stripe/stripe-js @stripe/react-stripe-js
```

---

## 2. ENVIRONMENT VARIABLES

### Java Spring Boot (application.properties)
```properties
# Stripe Secret Key (NIKDY NECOMMITOVAT!)
stripe.secret.key=sk_test_YOUR_SECRET_KEY_HERE

# Stripe Webhook Secret (volitelné)
stripe.webhook.secret=whsec_YOUR_WEBHOOK_SECRET_HERE

# Server port
server.port=8080
```

### Next.js (.env.local)
```env
# Stripe Publishable Key (může být veřejný)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Pro produkci (.env.production)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
NEXT_PUBLIC_API_URL=https://api.webpojede.cz
```

---

## 3. STRIPE DASHBOARD SETUP

1. **Získej API klíče:**
   - https://dashboard.stripe.com/apikeys
   - Zkopíruj `Publishable key` (pk_test_...) pro frontend
   - Zkopíruj `Secret key` (sk_test_...) pro backend

2. **Nastav Webhook (volitelné, ale doporučené):**
   - https://dashboard.stripe.com/webhooks
   - Klikni "Add endpoint"
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Vyber eventy: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Zkopíruj `Signing secret` (whsec_...) do application.properties

---

## 4. STRUKTURA SOUBORŮ

### Pro statický HTML web (současný stav):
```
webpojede.cz-main/
├── checkout.html          # Platební stránka
├── success.html           # Success stránka
└── assets/
    └── js/
        └── main.js        # Existující JS
```

### Pro Next.js (pokud migruješ):
```
app/
├── checkout/
│   └── page.tsx           # /checkout route
└── success/
    └── page.tsx           # /success route
components/
└── CheckoutForm.tsx       # Stripe formulář
utils/
└── stripe.ts              # Stripe singleton
```

### Java Backend:
```
src/main/java/com/webpojede/
├── controller/
│   ├── StripeController.java
│   └── StripeWebhookController.java
├── config/
│   └── CorsConfig.java
└── WebPojedeApplication.java
```

---

## 5. TESTOVÁNÍ

### Testovací karty (Stripe Test Mode):
- **Úspěšná platba:** `4242 4242 4242 4242`
- **Zamítnutá karta:** `4000 0000 0000 0002`
- **Vyžaduje autentizaci:** `4000 0025 0000 3155`
- **Nedostatek prostředků:** `4000 0000 0000 9995`

### Testovací data:
- Datum expirace: Jakýkoliv budoucí datum (např. 12/34)
- CVC: Jakékoliv 3 číslice (např. 123)
- PSČ: Jakékoliv (např. 12345)

---

## 6. PRODUKČNÍ CHECKLIST

- [ ] Změnit Stripe klíče na live (pk_live_..., sk_live_...)
- [ ] Nastavit HTTPS na backendu
- [ ] Aktualizovat CORS origins v CorsConfig.java
- [ ] Nastavit produkční webhook endpoint
- [ ] Otestovat s reálnou kartou (malá částka)
- [ ] Přidat error logging a monitoring
- [ ] Implementovat e-mailové notifikace

---

## 7. BĚŽNÉ PROBLÉMY

### CORS chyba
```
Access to fetch at 'http://localhost:8080/api/...' has been blocked by CORS policy
```
**Řešení:** Zkontroluj, že CorsConfig.java obsahuje správné origins.

### Stripe not defined
```
Uncaught ReferenceError: Stripe is not defined
```
**Řešení:** Ujisti se, že Stripe.js je načtený před tvým skriptem.

### Invalid API Key
```
Invalid API Key provided: sk_test_***
```
**Řešení:** Zkontroluj, že používáš správný Secret Key v application.properties.

---

## 8. KONTAKT PRO PODPORU

Pokud narazíš na problémy:
- Stripe dokumentace: https://stripe.com/docs
- Stripe Discord: https://discord.gg/stripe
- Stack Overflow: tag [stripe-payments]
