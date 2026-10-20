import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';

interface FAQItem {
  q: string;
  a: string;
  category: 'Ordering' | 'Delivery' | 'Reservations' | 'Halal & Food' | 'Payment';
}

export const FAQPage: React.FC = () => {
  const { settings } = useRestaurant();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      q: 'Is all your food 100% Halal certified?',
      a: 'Yes, absolutely. All beef, mutton, and chicken served at Royal Spice Restaurant are 100% zabiha halal, sourced directly from verified and hygienic local farms.',
      category: 'Halal & Food',
    },
    {
      q: 'How long does home delivery usually take?',
      a: 'Average delivery takes 30 to 45 minutes depending on your distance from our Dhanmondi kitchen. Orders are dispatched in thermal insulated bags to ensure piping-hot arrival.',
      category: 'Delivery',
    },
    {
      q: 'What is the minimum order amount for free delivery?',
      a: `Orders above ${settings.currencySymbol} ${settings.freeDeliveryThreshold} qualify for complimentary free home delivery anywhere within our Dhaka delivery zones.`,
      category: 'Delivery',
    },
    {
      q: 'Can I customize the spice level or add-ons of my dishes?',
      a: 'Yes! Every product detail page allows you to select optional add-ons (like extra eggs, shahi firni, raita) and specify special cooking instructions like "mild spice" or "no onions".',
      category: 'Ordering',
    },
    {
      q: 'What payment options do you support?',
      a: 'In this demo system, we support Cash on Delivery (COD), simulated bKash / Nagad mobile banking, and simulated Visa / Mastercard card payments.',
      category: 'Payment',
    },
    {
      q: 'How do table reservations work?',
      a: 'You can book your preferred dining booth, outdoor patio table, or private family room via our Table Reservations page. You will receive an instant reference code (e.g. RES-84921) with zero booking fees.',
      category: 'Reservations',
    },
    {
      q: 'Can I cancel or modify my reservation?',
      a: `Yes! There are no cancellation penalties. Simply give our guest relations hotline a call at ${settings.phone} or contact us online.`,
      category: 'Reservations',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCat !== 'All' && faq.category !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="py-12 space-y-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <HelpCircle className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Answers to Common Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#686B70] mt-2">
          Everything you need to know about our recipes, delivery zones, table reservations, and dietary guarantees.
        </p>

        {/* Search */}
        <div className="relative mt-6 max-w-md mx-auto">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g. delivery, halal, reservation)..."
            className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['All', 'Ordering', 'Delivery', 'Reservations', 'Halal & Food', 'Payment'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === cat
                ? 'bg-[#07131A] text-[#F5B51B]'
                : 'bg-white border border-[#E9E9E5] text-gray-600 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-[#E9E9E5] overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-900 hover:text-[#E9A817]"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xs text-[#E9A817] font-mono">Q.</span>
                  <span>{faq.q}</span>
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#F5B51B] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-50 bg-[#FAFAF8]">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Banner */}
      <div className="bg-[#07131A] text-white p-8 rounded-3xl text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold">Still have a question?</h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto">
          Our friendly restaurant concierge is happy to assist you with any questions or custom inquiries.
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <Link
            to="/contact"
            className="px-6 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] font-bold text-xs"
          >
            Contact Guest Relations
          </Link>
          <a
            href={`tel:${settings.phone}`}
            className="px-6 py-2.5 rounded-xl bg-transparent border border-gray-600 text-white font-semibold text-xs"
          >
            Call {settings.phone}
          </a>
        </div>
      </div>
    </div>
  );
};
