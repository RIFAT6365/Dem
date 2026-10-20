import React from 'react';
import { FileText, ShieldAlert } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const TermsPage: React.FC = () => {
  const { settings } = useRestaurant();

  return (
    <div className="py-12 space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <FileText className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Dining & Ordering Guidelines</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Terms and Conditions
        </h1>
        <p className="text-xs text-gray-500 mt-2">
          Effective October 2026 • Demo Restaurant Terms of Service
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-12 shadow-sm space-y-6 text-xs text-gray-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-gray-900">1. Online Ordering & Fulfillment</h2>
          <p>
            By submitting an order on {settings.restaurantName}, you agree that orders are prepared fresh upon receipt. Estimated delivery times (typically 30–45 minutes) may vary depending on weather conditions, traffic across Dhaka city, and kitchen volume during peak hours.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-gray-900">2. Pricing & Currency</h2>
          <p>
            All listed menu prices are displayed in {settings.currency} ({settings.currencySymbol}) and represent demonstration amounts. The restaurant management reserves the right to modify promotional discounts, delivery thresholds, and dish availability at any time via the Admin Portal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-gray-900">3. Table Reservations Policy</h2>
          <p>
            Table bookings are reserved free of charge. We politely request that guests arrive within 15 minutes of their scheduled time slot. For table cancellations or party adjustments, please call our hotline at {settings.phone}.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-gray-900">4. Food Safety & Halal Guarantee</h2>
          <p>
            All kitchen preparation adheres to rigorous hygiene practices. All poultry, lamb, and beef items are strictly 100% Halal certified. If you or any member of your party has severe food allergies (e.g. dairy, nuts), please provide detailed instructions during checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-gray-900">5. Demo Application Disclaimer</h2>
          <p>
            This website is an interactive demonstration built for evaluation and testing. Simulated online payments do not deduct real funds, and customer records reside in the user's browser.
          </p>
        </section>
      </div>
    </div>
  );
};
