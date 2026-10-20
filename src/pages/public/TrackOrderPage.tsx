import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Clock,
  CheckCircle2,
  Bike,
  ChefHat,
  PackageCheck,
  Phone,
  MapPin,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { OrderStatus } from '../../types';

export const TrackOrderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [orderQuery, setOrderQuery] = useState(initialId);
  const [searchedId, setSearchedId] = useState(initialId);

  const { orders, settings } = useRestaurant();

  useEffect(() => {
    if (initialId) {
      setOrderQuery(initialId);
      setSearchedId(initialId);
    }
  }, [initialId]);

  const order = orders.find(
    (o) =>
      o.orderNumber.toUpperCase() === searchedId.trim().toUpperCase() ||
      o.id === searchedId.trim()
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setSearchedId(orderQuery.trim());
    setSearchParams({ id: orderQuery.trim().toUpperCase() });
  };

  // Status steps mapping
  const steps: { label: string; status: OrderStatus; icon: any }[] = [
    { label: 'Pending', status: 'Pending', icon: Clock },
    { label: 'Confirmed', status: 'Confirmed', icon: CheckCircle2 },
    { label: 'Preparing', status: 'Preparing', icon: ChefHat },
    { label: 'Ready', status: 'Ready', icon: PackageCheck },
    { label: 'On The Way', status: 'Out for Delivery', icon: Bike },
    { label: 'Delivered', status: 'Completed', icon: CheckCircle2 },
  ];

  const getStepStatus = (stepIndex: number, currentStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'Pending',
      'Confirmed',
      'Preparing',
      'Ready',
      'Out for Delivery',
      'Completed',
    ];

    if (currentStatus === 'Canceled') return 'canceled';
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="py-12 space-y-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <Bike className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Real-Time Kitchen & Courier Tracking</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-[#686B70] mt-2">
          Enter your order number to see live chef preparation progress, rider delivery updates, and estimated arrival time.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="e.g. ORD-1001"
              required
              className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] uppercase font-bold text-gray-900"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] text-xs font-bold uppercase tracking-wider transition-all shadow-md"
          >
            Track
          </button>
        </form>

        <div className="mt-2 text-xs text-gray-400">
          Recent demo sample orders:{' '}
          {orders.slice(0, 3).map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setOrderQuery(o.orderNumber);
                setSearchedId(o.orderNumber);
                setSearchParams({ id: o.orderNumber });
              }}
              className="font-bold text-[#07131A] hover:underline mx-1"
            >
              #{o.orderNumber}
            </button>
          ))}
        </div>
      </div>

      {order ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Order Header Card */}
          <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                  Active Order
                </span>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mt-0.5">
                  Order #{order.orderNumber}
                </h2>
                <span className="text-xs text-gray-500">
                  Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide bg-[#07131A] text-[#F5B51B]">
                  Status: {order.orderStatus}
                </span>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-8">
              <div className="relative flex items-center justify-between">
                {/* Horizontal line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0" />

                {steps.map((step, idx) => {
                  const state = getStepStatus(idx, order.orderStatus);
                  const Icon = step.icon;

                  let circleStyle = 'bg-white border-2 border-gray-300 text-gray-400';
                  if (state === 'completed') {
                    circleStyle = 'bg-emerald-600 border-2 border-emerald-600 text-white shadow-md';
                  } else if (state === 'current') {
                    circleStyle = 'bg-[#F5B51B] border-4 border-[#07131A] text-[#07131A] shadow-lg scale-110 animate-pulse';
                  }

                  return (
                    <div key={step.label} className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${circleStyle}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-bold mt-2 whitespace-nowrap ${
                        state === 'current' ? 'text-[#07131A] font-extrabold' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rider & Delivery Info banner */}
            {order.fulfillmentType === 'Delivery' ? (
              <div className="bg-[#FFF8E7] p-5 rounded-2xl border border-[#F5B51B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#07131A] text-[#F5B51B] flex items-center justify-center font-bold text-sm shrink-0">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Assigned Rider</span>
                    <span className="font-bold text-sm text-gray-900 block">
                      {order.riderName || 'Sohel Rana (Express Courier)'}
                    </span>
                    <span className="text-xs text-gray-600">
                      Phone: {order.riderPhone || '+880 1722 998877'}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Estimated Arrival</span>
                  <span className="font-serif text-xl font-extrabold text-[#07131A]">
                    {order.orderStatus === 'Completed' ? 'Delivered' : '15 – 25 Minutes'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <span className="text-xs font-bold text-gray-800 block">Takeaway Collection</span>
                <span className="text-xs text-gray-500 block mt-0.5">
                  Pick up address: {settings.address}
                </span>
              </div>
            )}
          </div>

          {/* Destination & Order Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery address details */}
            <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 shadow-sm space-y-3">
              <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E9A817]" />
                <span>Delivery Address</span>
              </h3>
              <div className="text-xs space-y-1 text-gray-600">
                <p className="font-bold text-gray-900">{order.customer.fullName}</p>
                <p>{order.customer.phone}</p>
                <p>{order.customer.address}</p>
                {order.customer.flatOrHouse && <p>{order.customer.flatOrHouse}</p>}
                <p>{order.customer.area}, {order.customer.city}</p>
                {order.customer.landmark && (
                  <p className="text-amber-800 font-medium">Landmark: {order.customer.landmark}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 shadow-sm space-y-3">
              <h3 className="font-serif text-base font-bold text-gray-900 flex items-center justify-between">
                <span>Items Ordered</span>
                <span className="text-xs text-gray-500">{order.items.length} items</span>
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-gray-100 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold text-gray-900">
                      {settings.currencySymbol} {item.total}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-bold text-gray-900">
                <span>Total Paid:</span>
                <span className="text-sm">{settings.currencySymbol} {order.total}</span>
              </div>
            </div>
          </div>
        </div>
      ) : searchedId ? (
        <div className="bg-white rounded-3xl border border-[#E9E9E5] p-12 text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-gray-900">Order #{searchedId} Not Found</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Please check the spelling of your order reference or select one of the recent demo orders shown above.
          </p>
        </div>
      ) : null}
    </div>
  );
};
