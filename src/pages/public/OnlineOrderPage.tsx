import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Store,
  Search,
  Plus,
  Minus,
  Check,
  ArrowRight,
  Flame,
  Star,
  Info,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Product } from '../../types';
import { QuickAddModal } from '../../components/common/QuickAddModal';

export const OnlineOrderPage: React.FC = () => {
  const { products, categories, settings, cart, cartTotals, updateCartQuantity } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'Delivery' | 'Takeaway'>('Delivery');
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="py-8 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header and Fulfillment Switch */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9E9E5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E9A817] mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Fast Express Online Kitchen</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
            Order Online for Delivery or Takeaway
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Freshly cooked to order • Delivered piping hot in insulated bags
          </p>
        </div>

        {/* Delivery / Takeaway Toggle */}
        <div className="flex items-center p-1.5 rounded-2xl bg-gray-100 border border-gray-200">
          <button
            type="button"
            onClick={() => setFulfillmentType('Delivery')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              fulfillmentType === 'Delivery'
                ? 'bg-[#07131A] text-[#F5B51B] shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Home Delivery (30-45m)</span>
          </button>
          <button
            type="button"
            onClick={() => setFulfillmentType('Takeaway')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              fulfillmentType === 'Takeaway'
                ? 'bg-[#07131A] text-[#F5B51B] shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Takeaway Pickup (15-20m)</span>
          </button>
        </div>
      </div>

      {/* Main Order Grid & Sidebar Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Category Navigation & Products */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search & Category Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#F5B51B]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#07131A] text-[#F5B51B]'
                    : 'bg-white border border-[#E9E9E5] text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Menu
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-[#07131A] text-[#F5B51B]'
                      : 'bg-white border border-[#E9E9E5] text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              const currentPrice = product.salePrice ?? product.price;
              return (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-2xl border border-[#E9E9E5] hover:border-[#F5B51B]/70 shadow-xs transition-all flex gap-4"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 bg-gray-100"
                  />
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-0.5">
                        <span className="font-semibold text-[#E9A817]">{product.dietaryLabels[0] || 'Popular'}</span>
                        <span>{product.prepTimeMinutes}m</span>
                      </div>
                      <Link
                        to={`/product/${product.slug}`}
                        className="font-serif font-bold text-sm text-[#17191C] hover:text-[#F5B51B] line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-[11px] text-[#686B70] line-clamp-2 mt-0.5">
                        {product.shortDescription}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className="font-extrabold text-sm text-[#07131A]">
                        {settings.currencySymbol} {currentPrice}
                      </span>
                      <button
                        onClick={() => setQuickAddProduct(product)}
                        className="px-3 py-1.5 rounded-lg bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sticky Order Summary & Cart */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E9A817]" />
                <h3 className="font-serif text-lg font-bold text-[#17191C]">Your Cart</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {cartTotals.itemCount} items
              </span>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-8 text-center text-gray-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-xs">Your basket is currently empty.</p>
                <p className="text-[11px] text-gray-400">Select dishes from the menu to start your order.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-xs py-2 border-b border-gray-50">
                    <div className="flex-grow">
                      <span className="font-bold text-gray-900 block leading-tight">{item.productName}</span>
                      {item.selectedOptions.length > 0 && (
                        <span className="text-[10px] text-gray-500 block">
                          + {item.selectedOptions.map((o) => o.name).join(', ')}
                        </span>
                      )}
                      <span className="font-bold text-[#07131A] block mt-1">
                        {settings.currencySymbol} {item.price * item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-5 h-5 rounded bg-white flex items-center justify-center text-gray-600 hover:text-black font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-5 h-5 rounded bg-white flex items-center justify-center text-gray-600 hover:text-black font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calculation Totals */}
            {cart.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold">{settings.currencySymbol} {cartTotals.subtotal}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>- {settings.currencySymbol} {cartTotals.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery</span>
                  <span>
                    {cartTotals.deliveryFee === 0 ? (
                      <strong className="text-emerald-600 font-bold">FREE</strong>
                    ) : (
                      `${settings.currencySymbol} ${cartTotals.deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>{settings.currencySymbol} {cartTotals.tax}</span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="font-serif text-base font-bold text-[#17191C]">Grand Total</span>
                  <span className="font-extrabold text-xl text-[#07131A]">
                    {settings.currencySymbol} {cartTotals.total}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="w-full mt-4 py-3.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/25 flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
        />
      )}
    </div>
  );
};
