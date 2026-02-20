import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

// DIGITAL TARIF Price ID - nastav v Vercel Environment Variables
const PRICE_ID = process.env.STRIPE_PRICE_ID;

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, name, paymentMethodId } = req.body;

        // Validace
        if (!PRICE_ID) {
            console.error('STRIPE_PRICE_ID is not set');
            return res.status(500).json({ error: 'Konfigurace serveru není kompletní' });
        }

        if (!email) {
            return res.status(400).json({ error: 'E-mail je povinný' });
        }

        if (!paymentMethodId) {
            return res.status(400).json({ error: 'Platební metoda je povinná' });
        }

        // 1. Najdi nebo vytvoř zákazníka
        let customer;
        
        const existingCustomers = await stripe.customers.list({
            email: email,
            limit: 1
        });
        
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: email,
                name: name || undefined,
                metadata: {
                    source: 'webpojede-checkout'
                }
            });
        }

        // 2. Připoj platební metodu k zákazníkovi
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customer.id,
        });

        // 3. Nastav jako výchozí platební metodu
        await stripe.customers.update(customer.id, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // 4. Vytvoř subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: PRICE_ID }],
            default_payment_method: paymentMethodId,
            payment_behavior: 'default_incomplete',
            payment_settings: {
                save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
            metadata: {
                source: 'webpojede-checkout',
                customer_email: email,
                customer_name: name || ''
            }
        });

        // 5. Vrať client secret pro potvrzení platby
        const invoice = subscription.latest_invoice;
        const paymentIntent = invoice.payment_intent;

        return res.status(200).json({
            subscriptionId: subscription.id,
            clientSecret: paymentIntent ? paymentIntent.client_secret : null,
            status: subscription.status
        });

    } catch (error) {
        console.error('Stripe error:', error);
        
        // Vrať srozumitelnou chybovou hlášku
        let message = 'Chyba při zpracování platby';
        
        if (error.type === 'StripeCardError') {
            message = error.message;
        } else if (error.code === 'resource_missing') {
            message = 'Platební metoda není platná';
        } else if (error.code === 'payment_method_invalid') {
            message = 'Neplatná karta';
        }

        return res.status(400).json({ error: message });
    }
}
