'use client';

import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { StripeElementsOptions } from '@stripe/stripe-js';
import { getStripe, API_BASE_URL, formatAmount } from '@/utils/stripe';
import CheckoutForm from '@/components/CheckoutForm';

/**
 * Checkout Page - Next.js App Router
 * 
 * Route: /checkout
 */

// Konfigurace produktu
const PRODUCT = {
  name: 'Webové stránky - Startovací poplatek',
  amount: 499000, // 4990 Kč v haléřích
  currency: 'czk',
};

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vytvoření PaymentIntent při načtení stránky
    const createPaymentIntent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: PRODUCT.amount,
            currency: PRODUCT.currency,
            description: PRODUCT.name,
          }),
        });

        if (!response.ok) {
          throw new Error('Nepodařilo se připravit platbu');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Nepodařilo se načíst platební formulář. Zkuste to prosím později.');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, []);

  // Stripe Elements options
  const stripeOptions: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe', // nebo 'night' pro tmavý vzhled
      variables: {
        colorPrimary: '#0071e3',
        colorBackground: '#ffffff',
        colorText: '#1d1d1f',
        colorDanger: '#ff3b30',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        spacingUnit: '4px',
        borderRadius: '12px',
        fontSizeBase: '16px',
      },
      rules: {
        '.Input': {
          border: '1px solid #e5e5e7',
          boxShadow: 'none',
          padding: '12px 16px',
        },
        '.Input:focus': {
          border: '1px solid #0071e3',
          boxShadow: '0 0 0 3px rgba(0, 113, 227, 0.1)',
        },
        '.Label': {
          fontWeight: '500',
          marginBottom: '8px',
        },
      },
    },
    locale: 'cs',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Připravujeme platební formulář...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Něco se pokazilo</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dokončení objednávky</h1>
          <p className="text-gray-600">Bezpečná platba přes Stripe</p>
        </div>

        {/* Checkout Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Order Summary */}
          <div className="bg-gray-50 p-6 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Shrnutí objednávky
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Služba</span>
                <span className="font-medium text-gray-900">{PRODUCT.name}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-900">Celkem k úhradě</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatAmount(PRODUCT.amount, PRODUCT.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-6">
            {clientSecret && (
              <Elements stripe={getStripe()} options={stripeOptions}>
                <CheckoutForm amount={PRODUCT.amount} />
              </Elements>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 flex items-center justify-center gap-4 opacity-60">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
            alt="Visa"
            className="h-6"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
            alt="Mastercard"
            className="h-6"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg"
            alt="Apple Pay"
            className="h-6"
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg"
            alt="Google Pay"
            className="h-6"
          />
        </div>
      </div>
    </main>
  );
}
