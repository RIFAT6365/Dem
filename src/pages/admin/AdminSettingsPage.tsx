import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, Settings, DollarSign, Bike, ShieldCheck, Phone, MapPin, HardDrive, Cloud, ExternalLink } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { WebsiteSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, showToast } = useRestaurant();
  const [formData, setFormData] = useState<WebsiteSettings>({ ...settings });

  const handleChange = (field: keyof WebsiteSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-sans not-italic text-2xl font-bold text-gray-900">
            Restaurant Configuration & Store Settings
          </h1>
          <p className="text-xs text-gray-500">
            Configure delivery fees, taxes, store currency, contact numbers, and fulfillment rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Brand Identity */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">1</span>
            Restaurant Brand & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                value={formData.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Dining Hours
              </label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => handleChange('openingHours', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Store Physical Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>
        </div>

        {/* Financial, Currency & Pricing Configuration */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">2</span>
            Currency & Checkout Calculations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] font-bold"
              />
              <span className="text-[10px] text-gray-400 mt-0.5 block">e.g. ৳, $, €, £</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Standard Delivery Fee
              </label>
              <input
                type="number"
                min="0"
                value={formData.deliveryFee}
                onChange={(e) => handleChange('deliveryFee', Number(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Free Delivery Order Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.freeDeliveryThreshold}
                onChange={(e) => handleChange('freeDeliveryThreshold', Number(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Tax / VAT Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.taxRatePercent}
                onChange={(e) => handleChange('taxRatePercent', Number(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Minimum Order Amount
              </label>
              <input
                type="number"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) => handleChange('minOrderAmount', Number(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>
          </div>
        </div>

        {/* Fulfillment & Payment Toggles */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">3</span>
            Store Policies & Payment Gateways
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.allowPickup}
                onChange={(e) => handleChange('allowPickup', e.target.checked)}
                className="w-4 h-4 accent-[#F5B51B]"
              />
              <div>
                <span className="block text-xs font-bold text-gray-900">Takeaway Pickup</span>
                <span className="block text-[10px] text-gray-400">Allow customers to pick up at counter</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.allowCashOnDelivery}
                onChange={(e) => handleChange('allowCashOnDelivery', e.target.checked)}
                className="w-4 h-4 accent-[#F5B51B]"
              />
              <div>
                <span className="block text-xs font-bold text-gray-900">Cash on Delivery (COD)</span>
                <span className="block text-[10px] text-gray-400">Enable cash payments to couriers</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.allowOnlinePayment}
                onChange={(e) => handleChange('allowOnlinePayment', e.target.checked)}
                className="w-4 h-4 accent-[#F5B51B]"
              />
              <div>
                <span className="block text-xs font-bold text-gray-900">Digital Payments</span>
                <span className="block text-[10px] text-gray-400">bKash, Nagad & card options</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 5: Google Drive Cloud Integration & Database Backups */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
            <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">5</span>
              Google Drive Cloud Sync & Backups
            </h2>
            <Link
              to="/admin/drive"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors border border-blue-200"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Open Google Drive Manager</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-900 font-sans block">
                Automatic Cloud Backups & Export Tools
              </span>
              <p className="text-[11px] text-blue-700/80 leading-relaxed max-w-xl">
                Connect Google Drive to create scheduled database snapshots, export daily sales orders into spreadsheet CSV files, and restore menus or previous versions with one click.
              </p>
            </div>
            <Link
              to="/admin/drive"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#4285F4] hover:bg-blue-600 text-white font-bold text-xs transition-colors shadow-xs whitespace-nowrap"
            >
              Configure Google Drive
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};
