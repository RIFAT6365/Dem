/**
 * Customer Order Detail & Tracking Page
 * Displays full order snapshot, status progression timeline, rider info, and printable receipt
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import {
  ArrowLeft,
  ShoppingBag,
  Bike,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';

const ORDER_STEPS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Completed',
];

export const AccountOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { settings, orders: contextOrders } = useRestaurant();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Check context first or query Supabase
    const foundInContext = contextOrders.find((o) => o.id === id || o.orderNumber === id);
    if (foundInContext) {
      setOrder(foundInContext);
      setLoading(false);
    } else {
      orderService.getOrderById(id).then((data) => {
        setOrder(data);
        setLoading(false);
      });
    }
  }, [id, contextOrders]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-12 text-center text-xs text-gray-400">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-serif text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-xs text-gray-500">
          The requested order identifier does not exist or you do not have permission to view it.
        </p>
        <Link
          to="/account/orders"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#07131A] text-[#F5B51B] font-bold text-xs"
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  const currentStepIdx = ORDER_STEPS.indexOf(order.orderStatus);

  return (
    <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <Link
            to="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              order.orderStatus === 'Completed'
                ? 'bg-emerald-100 text-emerald-800'
                : order.orderStatus === 'Canceled'
                ? 'bg-red-100 text-red-800'
                : 'bg-[#FFF8E7] text-[#07131A] border border-[#F5B51B]/40'
            }`}>
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt</span>
        </button>
      </div>

      {/* Status Progression Timeline */}
      {order.orderStatus !== 'Canceled' ? (
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#E9A817]" />
              <span>Live Kitchen & Delivery Status</span>
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              Estimated Delivery: ~{order.estimatedDeliveryMinutes || 35} mins
            </span>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
            {ORDER_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} className="text-center space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isPast
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-[#F5B51B] animate-pulse'
                        : 'bg-gray-200'
                    }`}
                  />
                  <span
                    className={`text-[10px] block leading-tight font-semibold ${
                      isCurrent
                        ? 'text-[#07131A] font-bold underline'
                        : isPast
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>This order was canceled. If you have questions, please call {settings.phone}.</span>
        </div>
      )}

      {/* Rider Info Card (If Out for Delivery) */}
      {order.riderName && (
        <div className="p-4 rounded-2xl bg-[#FFF8E7] border border-[#F5B51B]/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#07131A] text-[#F5B51B] flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900">Delivery Rider: {order.riderName}</div>
              {order.riderPhone && (
                <div className="text-gray-500 text-[11px] mt-0.5">Phone: {order.riderPhone}</div>
              )}
            </div>
          </div>
          {order.riderPhone && (
            <a
              href={`tel:${order.riderPhone}`}
              className="px-3 py-1.5 rounded-lg bg-[#F5B51B] text-[#07131A] font-bold text-xs hover:bg-[#E9A817]"
            >
              Call Rider
            </a>
          )}
        </div>
      )}

      {/* Order Items Table */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-gray-900">Ordered Items Snapshot</h3>
        <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50">
              <div className="flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                )}
                <div>
                  <div className="font-bold text-gray-900">{item.name}</div>
                  {item.optionsSummary && (
                    <div className="text-[11px] text-gray-400 mt-0.5">+{item.optionsSummary}</div>
                  )}
                  {item.specialInstructions && (
                    <div className="text-[10px] text-amber-700 italic mt-0.5">
                      Note: {item.specialInstructions}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {settings.currencySymbol} {item.total}
                </div>
                <div className="text-[10px] text-gray-400">
                  {item.quantity} x {settings.currencySymbol} {item.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & Financial Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-xs">
        {/* Left: Delivery Details */}
        <div className="space-y-2">
          <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
            Delivery Information
          </h4>
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5 text-gray-700">
            <div className="font-bold text-gray-900">{order.customer.fullName}</div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Phone className="w-3.5 h-3.5" />
              <span>{order.customer.phone}</span>
            </div>
            <div className="flex items-start gap-1.5 text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {order.customer.flatOrHouse && `${order.customer.flatOrHouse}, `}
                {order.customer.address}, {order.customer.area}, {order.customer.city}
              </span>
            </div>
            {order.customer.notes && (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-2">
                Instructions: {order.customer.notes}
              </div>
            )}
          </div>
        </div>

        {/* Right: Price Breakdown */}
        <div className="space-y-2">
          <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
            Payment Breakdown
          </h4>
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{settings.currencySymbol} {order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon Discount ({order.couponCode || 'PROMO'})</span>
                <span>- {settings.currencySymbol} {order.discount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>
                {order.deliveryFee === 0 ? 'FREE' : `${settings.currencySymbol} ${order.deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax / VAT ({settings.taxRatePercent}%)</span>
              <span>{settings.currencySymbol} {order.tax}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between font-extrabold text-sm text-[#07131A]">
              <span>Total Amount</span>
              <span className="text-base">{settings.currencySymbol} {order.total}</span>
            </div>
            <div className="pt-2 text-[11px] text-gray-500 flex justify-between">
              <span>Payment Method:</span>
              <span className="font-bold text-gray-800">{order.paymentMethod}</span>
            </div>
            <div className="text-[11px] text-gray-500 flex justify-between">
              <span>Payment Status:</span>
              <span className="font-bold text-gray-800">{order.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
