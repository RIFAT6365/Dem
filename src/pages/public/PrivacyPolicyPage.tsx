import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useRestaurant();

  return (
    <div className="py-12 space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <ShieldCheck className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Transparency & Trust</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-500 mt-2">
          Last revised: October 2026 • Demo Restaurant Template
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-12 shadow-sm space-y-6 text-xs text-gray-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-gray-900">1. Information We Collect</h2>
          <p>
            When you place an order or book a table reservation at {settings.restaurantName}, we collect basic fulfillment information including your full name, contact telephone number, optional email address, and physical delivery coordinates in Dhaka.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-gray-900">2. Demo Mode Data Storage</h2>
          <p>
            Please note that this website operates in demonstration mode using browser LocalStorage. No real financial credit card information, bank PINs, or confidential personal identity numbers are collected or transmitted over unsecured networks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-gray-900">3. How Your Information is Used</h2>
          <p>
            Customer details are strictly used to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Dispatch couriers to your specific delivery address and landmark.</li>
            <li>Send order confirmation references and SMS/call updates regarding kitchen readiness.</li>
            <li>Assign and reserve tables according to seating preferences and party sizes.</li>
            <li>Allow customers to review previous order history on the demo profile page.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-gray-900">4. Contact & Inquiries</h2>
          <p>
            If you have questions regarding data privacy or wish to reset your demo records, you can click "Reset Demo Data" inside the Admin Dashboard or reach us at {settings.email}.
          </p>
        </section>
      </div>
    </div>
  );
};
