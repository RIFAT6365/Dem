import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Copy, Check, Sparkles, ArrowRight, Clock, Percent } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const OffersPage: React.FC = () => {
  const { coupons, settings, showToast, applyCouponCode } = useRestaurant();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeCoupons = coupons.filter((c) => c.isActive);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="py-12 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <Sparkles className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Exclusive Savings</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Special Deals & Coupons
        </h1>
        <p className="text-xs sm:text-sm text-[#686B70] mt-2">
          Apply these verified vouchers during online checkout to enjoy discounts on delicious biryani, grills, and family feasts.
        </p>
      </div>

      {/* Grid of active coupons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white rounded-3xl border border-[#E9E9E5] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group"
          >
            {/* Decorative ribbon */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-[#F5B51B]/20 to-transparent pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#07131A] text-[#F5B51B]">
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% OFF`
                    : `${settings.currencySymbol} ${coupon.discountValue} OFF`}
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Valid till {coupon.validTo}
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-[#17191C]">
                {coupon.name}
              </h3>

              <div className="my-4 p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex items-center justify-between">
                <span className="font-mono text-base font-extrabold text-[#07131A] tracking-wider">
                  {coupon.code}
                </span>
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1 shadow-xs transition-colors"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Minimum order: {settings.currencySymbol} {coupon.minOrderValue}</li>
                {coupon.maxDiscount && (
                  <li>• Maximum discount: {settings.currencySymbol} {coupon.maxDiscount}</li>
                )}
                <li>• Used {coupon.usedCount} times of {coupon.usageLimit}</li>
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-gray-100">
              <Link
                to="/order"
                onClick={() => applyCouponCode(coupon.code)}
                className="w-full py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Apply & Order Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
