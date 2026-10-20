import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const CartPage: React.FC = () => {
  const {
    cart,
    cartTotals,
    settings,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
  } = useRestaurant();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = applyCouponCode(couponInput.trim());
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  return (
    <div className="py-12 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Your Food Cart
        </h1>
        <p className="text-xs sm:text-sm text-[#686B70] mt-2">
          Review your delicious selected dishes, apply discount vouchers, and proceed to checkout.
        </p>
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <div className="bg-white rounded-3xl border border-[#E9E9E5] p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Looks like you haven't added any royal delicacies to your cart yet. Browse our menu to satisfy your cravings.
          </p>
          <div className="pt-2">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20"
            >
              <span>Explore Our Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Cart With Items */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items Table / List */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="font-serif text-xl font-bold text-[#17191C]">
                Selected Items ({cartTotals.itemCount})
              </span>
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
              {cart.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shrink-0"
                    />
                    <div>
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-serif text-base font-bold text-gray-900 hover:text-[#F5B51B]"
                      >
                        {item.productName}
                      </Link>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="text-[11px] text-gray-500 mt-0.5 space-x-1">
                          <span>Options:</span>
                          <span className="font-medium text-gray-700">
                            {item.selectedOptions.map((o) => `${o.name} (+${settings.currencySymbol}${o.price})`).join(', ')}
                          </span>
                        </div>
                      )}
                      {item.specialInstructions && (
                        <p className="text-[11px] text-amber-700 mt-0.5 italic">
                          Note: "{item.specialInstructions}"
                        </p>
                      )}
                      <span className="text-xs font-bold text-gray-700 block mt-1 sm:hidden">
                        {settings.currencySymbol} {item.price * item.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-700 hover:text-black font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-[#07131A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-700 hover:text-black font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total item price */}
                    <div className="hidden sm:block text-right min-w-[80px]">
                      <span className="text-base font-extrabold text-[#07131A] block">
                        {settings.currencySymbol} {item.price * item.quantity}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {settings.currencySymbol} {item.price} each
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#07131A]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Coupon & Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            {/* Coupon Code Box */}
            <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <Tag className="w-4 h-4 text-[#E9A817]" />
                <span>Promo / Coupon Code</span>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                      <span className="block text-[10px] text-emerald-700">
                        {appliedCoupon.discountType === 'percentage'
                          ? `${appliedCoupon.discountValue}% OFF discount applied`
                          : `${settings.currencySymbol} ${appliedCoupon.discountValue} OFF applied`}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={removeCouponCode}
                    className="p-1 text-emerald-700 hover:text-red-600"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                      }}
                      placeholder="e.g. ROYALSPICE, WELCOME10"
                      className="flex-grow text-xs p-3 rounded-xl border border-gray-200 uppercase focus:outline-none focus:border-[#F5B51B]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[#07131A] text-[#F5B51B] text-xs font-bold hover:bg-black transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{couponError}</span>
                    </p>
                  )}
                  <div className="text-[11px] text-gray-400">
                    Try sample codes: <strong className="text-gray-700">ROYALSPICE</strong> or <strong className="text-gray-700">FREEDELIVERY</strong>
                  </div>
                </form>
              )}
            </div>

            {/* Summary Box */}
            <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#17191C] pb-3 border-b border-gray-100">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">
                    {settings.currencySymbol} {cartTotals.subtotal}
                  </span>
                </div>

                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Savings</span>
                    <span>- {settings.currencySymbol} {cartTotals.discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery Fee</span>
                  <span>
                    {cartTotals.deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE DELIVERY</span>
                    ) : (
                      `${settings.currencySymbol} ${cartTotals.deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>VAT / Tax ({settings.taxRatePercent}%)</span>
                  <span>{settings.currencySymbol} {cartTotals.tax}</span>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="font-serif text-lg font-bold text-[#17191C]">Estimated Total</span>
                  <span className="font-extrabold text-2xl text-[#07131A]">
                    {settings.currencySymbol} {cartTotals.total}
                  </span>
                </div>
              </div>

              {cartTotals.subtotal < settings.freeDeliveryThreshold && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Add {settings.currencySymbol} {settings.freeDeliveryThreshold - cartTotals.subtotal} more to unlock <strong>Free Delivery</strong>!
                  </span>
                </div>
              )}

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/25 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
