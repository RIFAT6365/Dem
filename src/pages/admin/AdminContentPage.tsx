import React, { useState } from 'react';
import { Save, FileText, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const AdminContentPage: React.FC = () => {
  const { settings, updateSettings, showToast } = useRestaurant();

  const [heroHeading, setHeroHeading] = useState('Good Food Brings People Together');
  const [heroSubtitle, setHeroSubtitle] = useState('Experience the authentic taste of traditional recipes, prepared with fresh ingredients and full of flavor.');
  const [storyTitle, setStoryTitle] = useState('Our Story, Our Passion');
  const [storyText, setStoryText] = useState('At Royal Spice Restaurant, we believe that great food brings people together. We serve a variety of delicious dishes made from fresh ingredients, with authentic flavors.');
  const [promoBanner, setPromoBanner] = useState('Special Offer: Free delivery on orders over ৳ 600! Code: FREEDELIVERY');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      tagline: heroHeading,
    });
    showToast('Homepage CMS content saved and published!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-sans not-italic text-2xl font-bold text-gray-900">
            Homepage & Brand Content CMS
          </h1>
          <p className="text-xs text-gray-500">
            Update hero headlines, promotional announcements, and restaurant story copy.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save CMS Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section Copy */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">1</span>
            Hero Banner Headlines
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Main Hero Heading
            </label>
            <input
              type="text"
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Hero Subtitle / Value Proposition
            </label>
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>
        </div>

        {/* Promo Top Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">2</span>
            Site-Wide Promotional Ticker Notice
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Top Notification Announcement
            </label>
            <input
              type="text"
              value={promoBanner}
              onChange={(e) => setPromoBanner(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>
        </div>

        {/* Restaurant Story */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">3</span>
            Homepage Story Section
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Story Heading
            </label>
            <input
              type="text"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Story Paragraph
            </label>
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              rows={4}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
