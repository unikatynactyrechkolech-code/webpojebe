import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, currency = 'czk', description, productId } = req.body;

        // Validate amount
        if (!amount || amount < 100) {
            return res.status(400).json({ 
                error: 'Neplatná částka. Minimální částka je 1 Kč.' 
            });
        }

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Částka v haléřích
            currency: currency.toLowerCase(),
            description: description || 'WebPojede - Platba za služby',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                source: 'webpojede-checkout',
                product: productId || 'web-standard',
            },
        });

        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });

    } catch (error) {
        console.error('Stripe error:', error);
        
        return res.status(500).json({ 
            error: 'Nepodařilo se vytvořit platbu.',
            message: error.message 
        });
    }
}
