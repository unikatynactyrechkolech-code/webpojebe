import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * Stripe Singleton Instance
 * 
 * Zajišťuje, že se Stripe načte pouze jednou.
 * Použití: import { getStripe } from '@/utils/stripe';
 */

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!key) {
      console.error('❌ Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
      throw new Error('Stripe publishable key is not configured');
    }
    
    stripePromise = loadStripe(key);
  }
  
  return stripePromise;
};

/**
 * Formátování částky pro zobrazení
 */
export const formatAmount = (amount: number, currency: string = 'CZK'): string => {
  const formatter = new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  });
  
  // Stripe používá nejmenší jednotku měny (haléře pro CZK)
  return formatter.format(amount / 100);
};

/**
 * API URL pro backend
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
