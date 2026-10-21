import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Bike,
  Store,
  Phone,
  Mail,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Navigation,
  Lock,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { FulfillmentType, PaymentMethod } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { cart, cartTotals, settings, createOrder, showToast, appliedCoupon } = useRestaurant();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Fulfillment
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('Delivery');

  // Customer Contact Fields (initialized from real authenticated customer profile)
  const [fullName, setFullName] = useState(profile?.fullName || user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || user?.user_metadata?.phone || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');

  // Customer Delivery Location Fields
  const [city, setCity] = useState('Dhaka');
  const [area, setArea] = useState('Dhanmondi');
  const [address, setAddress] = useState('');
  const [flatOrHouse, setFlatOrHouse] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [selectedMapPin, setSelectedMapPin] = useState('Dhanmondi Lakefront Point');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available Dhaka delivery zones
  const deliveryAreas = [
    'Dhanmondi',
    'Gulshan-1',
    'Gulshan-2',
    'Banani',
    'Uttara (Sector 1-14)',
    'Mirpur-1 to 14',
    'Mohammadpur',
    'Baily Road / Shantinagar',
    'Bashundhara R/A',
    'Badda / Rampura',
    'Motijheel / Dilkusha',
  ];

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-10 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#E9A817] flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Account Required to Order
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
              Guest checkout is disabled for security, live delivery tracking, and order history.
              Please sign in or create an account to proceed with your order.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Your Cart ({cartTotals.itemCount} items)</span>
              <span>{settings.currencySymbol} {cartTotals.total}</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Your selected items will remain saved in your cart while you log in.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/login?redirect=/checkout"
              className="w-full py-3.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#F5B51B]/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Complete Order</span>
            </Link>

            <Link
              to="/signup?redirect=/checkout"
              className="w-full py-3 rounded-xl bg-[#07131A] hover:bg-black text-[#F5B51B] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-gray-800">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Food Menu</span>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in to place your order.', 'error');
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      showToast('Please provide your name and phone number.', 'error');
      return;
    }

    if (fulfillmentType === 'Delivery' && (!address.trim() || !area.trim())) {
      showToast('Please specify your delivery address and area.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await createOrder({
        customer: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          city,
          area,
          address: address.trim(),
          flatOrHouse: flatOrHouse.trim(),
          landmark: landmark.trim(),
          notes: deliveryNotes.trim(),
        },
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.productName,
          image: item.productImage,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          optionsSummary: item.selectedOptions.map((o) => o.name).join(', '),
          specialInstructions: item.specialInstructions,
        })),
        subtotal: cartTotals.subtotal,
        tax: cartTotals.tax,
        deliveryFee: fulfillmentType === 'Delivery' ? cartTotals.deliveryFee : 0,
        discount: cartTotals.discount,
        couponCode: appliedCoupon?.code,
        total: fulfillmentType === 'Delivery' ? cartTotals.total : Math.max(0, cartTotals.subtotal - cartTotals.discount + cartTotals.tax),
        fulfillmentType,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        orderStatus: 'Pending',
        estimatedDeliveryMinutes: fulfillmentType === 'Delivery' ? 35 : 15,
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F5B51B', '#E9A817', '#07131A', '#10B981'],
      });

      navigate(`/order-confirmation/${order.orderNumber}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
          Order Checkout & Delivery Details
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review your delivery location address, contact info, and select simulated payment.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Form: Details, Address & Payment */}
        <div className="lg:col-span-8 space-y-8">
          {/* 1. Fulfillment Toggle */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9E9E5] shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F5B51B] text-[#07131A] text-xs font-extrabold flex items-center justify-center">1</span>
              Fulfillment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFulfillmentType('Delivery')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  fulfillmentType === 'Delivery'
                    ? 'border-[#F5B51B] bg-[#FFF8E7] ring-1 ring-[#F5B51B]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Bike className="w-5 h-5 text-[#E9A817] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-gray-900 block">Express Delivery</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Delivery to your home or office address in 30–45 mins.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentType('Takeaway')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  fulfillmentType === 'Takeaway'
                    ? 'border-[#F5B51B] bg-[#FFF8E7] ring-1 ring-[#F5B51B]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Store className="w-5 h-5 text-[#E9A817] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs text-gray-900 block">Takeaway Pickup</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Collect piping hot directly at our restaurant counter in 15–20 mins.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Customer Contact Info */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9E9E5] shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F5B51B] text-[#07131A] text-xs font-extrabold flex items-center justify-center">2</span>
              Recipient Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Customer Location Address Form (User Explicit Request!) */}
          {fulfillmentType === 'Delivery' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E9E9E5] shadow-xs space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F5B51B] text-[#07131A] text-xs font-extrabold flex items-center justify-center">3</span>
                  Customer Delivery Location & Address Form
                </h2>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Dhaka Zone Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    City / Division *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Delivery Area / Neighborhood *
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] bg-white"
                  >
                    {deliveryAreas.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Street Address / Road Number *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. House 42, Road 7/A"
                    required
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Flat / Apartment / Floor
                  </label>
                  <input
                    type="text"
                    value={flatOrHouse}
                    onChange={(e) => setFlatOrHouse(e.target.value)}
                    placeholder="e.g. Flat 4B, 4th Floor"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Nearest Landmark / Guide Point
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Rabindra Sarobar Lake, Beside City Bank ATM"
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              {/* Pinpoint Map Location Selector Preview */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#E9A817]" />
                    Interactive Pinpoint Map Location
                  </span>
                  <span className="text-[11px] text-gray-500">Auto-detected coordinate</span>
                </div>

                <div className="relative h-36 rounded-xl overflow-hidden bg-gray-900 border border-gray-300 shadow-inner group">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                    alt="Delivery Map Pinpoint"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-[#07131A]/30 flex flex-col items-center justify-center p-2 text-center text-white">
                    <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shadow-lg animate-bounce">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold bg-[#07131A]/90 px-3 py-1 rounded-full mt-2 border border-white/20">
                      📍 {area}, {city}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Pin: {selectedMapPin}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMapPin(`Pinned Area (${area})`);
                      showToast('Delivery pin coordinates locked!');
                    }}
                    className="text-[#E9A817] font-bold hover:underline"
                  >
                    Adjust Pin Location
                  </button>
                </div>
              </div>

              {/* Rider Delivery Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                  Rider Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Leave with security guard, please do not ring doorbell..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>
            </div>
          )}

          {/* 4. Payment Method */}
          <div className="bg-white p-6 rounded-3xl border border-[#E9E9E5] shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#F5B51B] text-[#07131A] text-xs font-extrabold flex items-center justify-center">
                {fulfillmentType === 'Delivery' ? '4' : '3'}
              </span>
              Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-[#F5B51B] bg-[#FFF8E7] ring-1 ring-[#F5B51B]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600 mb-2" />
                <span className="font-bold text-xs text-gray-900 block">Cash on Delivery</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Pay in cash to rider upon arrival</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bKash / Mobile Banking')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'bKash / Mobile Banking'
                    ? 'border-[#F5B51B] bg-[#FFF8E7] ring-1 ring-[#F5B51B]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-5 h-5 text-pink-600 mb-2" />
                <span className="font-bold text-xs text-gray-900 block">bKash / Nagad</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Simulated mobile banking payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Online Payment')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'Online Payment'
                    ? 'border-[#F5B51B] bg-[#FFF8E7] ring-1 ring-[#F5B51B]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-600 mb-2" />
                <span className="font-bold text-xs text-gray-900 block">Card Payment</span>
                <span className="text-[10px] text-gray-500 block mt-0.5">Simulated Visa / Mastercard gateway</span>
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Demo Mode: No real financial credentials or card details are collected or processed.
              </span>
            </div>
          </div>
        </div>

        {/* Right Summary Box */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#17191C] pb-3 border-b border-gray-100 flex items-center justify-between">
              <span>Order Breakdown</span>
              <span className="text-xs font-semibold text-gray-500">
                {cartTotals.itemCount} items
              </span>
            </h3>

            {/* Items scroll */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-gray-800">{item.quantity}x</span>
                    <div className="truncate max-w-[170px]">
                      <span className="text-gray-800 font-medium truncate block">{item.productName}</span>
                      {item.selectedOptions.length > 0 && (
                        <span className="text-[10px] text-gray-400 truncate block">
                          +{item.selectedOptions.map((o) => o.name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-[#07131A] shrink-0">
                    {settings.currencySymbol} {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{settings.currencySymbol} {cartTotals.subtotal}</span>
              </div>
              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>- {settings.currencySymbol} {cartTotals.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>
                  {fulfillmentType === 'Takeaway' || cartTotals.deliveryFee === 0 ? (
                    <strong className="text-emerald-600 font-bold">FREE</strong>
                  ) : (
                    `${settings.currencySymbol} ${cartTotals.deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax / VAT ({settings.taxRatePercent}%)</span>
                <span>{settings.currencySymbol} {cartTotals.tax}</span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <span className="font-serif text-lg font-bold text-[#17191C]">Total Payable</span>
                <span className="font-extrabold text-2xl text-[#07131A]">
                  {settings.currencySymbol}{' '}
                  {fulfillmentType === 'Delivery'
                    ? cartTotals.total
                    : Math.max(0, cartTotals.subtotal - cartTotals.discount + cartTotals.tax)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/25 flex items-center justify-center gap-2 ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-600 cursor-wait'
                  : 'bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Demo Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Place Order Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
