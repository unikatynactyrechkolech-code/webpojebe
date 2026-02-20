'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Success Page - zobrazí se po úspěšné platbě
 * 
 * Route: /success
 */
export default function SuccessPage() {
  // Confetti efekt
  useEffect(() => {
    const colors = ['#0071e3', '#5856d6', '#34c759', '#ff9f0a', '#ff3b30'];
    
    const createConfetti = () => {
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 8 + 5}px;
            height: ${Math.random() * 8 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: 2px;
            pointer-events: none;
            z-index: 1000;
            animation: confetti-fall ${Math.random() * 2 + 2}s ease-out forwards;
          `;
          document.body.appendChild(confetti);
          
          setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
      }
    };

    // Přidání keyframes do dokumentu
    const style = document.createElement('style');
    style.textContent = `
      @keyframes confetti-fall {
        0% { opacity: 1; transform: translateY(0) rotate(0deg); }
        100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
      }
    `;
    document.head.appendChild(style);
    
    createConfetti();
    
    return () => {
      style.remove();
    };
  }, []);

  // Generování čísla objednávky
  const orderNumber = `WP-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 max-w-lg w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-[scale-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Platba proběhla úspěšně!
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Děkujeme za vaši důvěru. Brzy se vám ozveme s dalšími kroky.
        </p>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-500">Číslo objednávky</span>
            <span className="font-semibold text-gray-900">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-500">Služba</span>
            <span className="font-semibold text-gray-900">Webové stránky</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-500">Uhrazeno</span>
            <span className="font-semibold text-green-600">4 990 Kč</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2"
          >
            Zpět na hlavní stránku
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            href="/kontakt"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Kontaktovat nás
          </Link>
        </div>
      </div>
    </main>
  );
}
