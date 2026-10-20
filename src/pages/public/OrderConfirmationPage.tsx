import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Printer,
  Bike,
  Store,
  MapPin,
  Phone,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, settings } = useRestaurant();

  const order = orders.find(
    (o) => o.orderNumber.toUpperCase() === orderId?.toUpperCase() || o.id === orderId
  );

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-gray-800">Order Not Found</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          We could not locate order "{orderId}". Please verify your order number.
        </p>
        <Link
          to="/track-order"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold"
        >
          <span>Track Another Order</span>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-12 space-y-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Success Banner */}
      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-10 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFF8E7] text-[#07131A] uppercase tracking-wider border border-[#F5B51B]/40">
            Order Confirmed • #{order.orderNumber}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
            Thank You, {order.customer.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
            Your order has been received by our kitchen staff and is currently queued for preparation.
          </p>
        </div>

        {/* Live track CTA button */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={`/track-order?id=${order.orderNumber}`}
            className="px-6 py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/25 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Track Live Order Status</span>
          </Link>
          <button
            onClick={handlePrint}
            className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Itemized Printable Invoice / Summary Card */}
      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#17191C]">
              {settings.restaurantName}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{settings.address}</p>
            <p className="text-xs text-gray-500">Phone: {settings.phone}</p>
          </div>
          <div className="text-left sm:text-right text-xs">
            <span className="font-bold text-gray-900 block">Invoice #{order.orderNumber}</span>
            <span className="text-gray-500 block">Date: {new Date(order.createdAt).toLocaleString()}</span>
            <span className="text-emerald-700 font-bold block mt-1">
              Payment: {order.paymentMethod} ({order.paymentStatus})
            </span>
          </div>
        </div>

        {/* Delivery / Recipient details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Recipient Information
            </span>
            <p className="font-bold text-gray-900 text-sm">{order.customer.fullName}</p>
            <p className="text-gray-600 mt-0.5">{order.customer.phone}</p>
            {order.customer.email && <p className="text-gray-600">{order.customer.email}</p>}
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Fulfillment & Destination
            </span>
            <p className="font-bold text-gray-900 text-sm">
              {order.fulfillmentType === 'Delivery' ? 'Express Delivery' : 'Takeaway Pickup'}
            </p>
            {order.fulfillmentType === 'Delivery' ? (
              <>
                <p className="text-gray-600 mt-0.5">{order.customer.address}</p>
                {order.customer.flatOrHouse && <p className="text-gray-600">{order.customer.flatOrHouse}</p>}
                <p className="text-gray-600">{order.customer.area}, {order.customer.city}</p>
                {order.customer.notes && (
                  <p className="text-amber-800 font-medium mt-1">Note: {order.customer.notes}</p>
                )}
              </>
            ) : (
              <p className="text-gray-600 mt-0.5">Pick up at: {settings.address}</p>
            )}
          </div>
        </div>

        {/* Item table */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100 flex justify-between">
            <span>Dish Description</span>
            <span className="text-right">Price</span>
          </div>

          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                />
                <div>
                  <span className="font-bold text-gray-900 block">{item.name}</span>
                  <span className="text-[11px] text-gray-500">
                    {item.quantity} × {settings.currencySymbol} {item.price}
                    {item.optionsSummary && ` (${item.optionsSummary})`}
                  </span>
                </div>
              </div>
              <span className="font-bold text-gray-900">
                {settings.currencySymbol} {item.total}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="pt-2 border-t border-gray-200 space-y-2 text-xs max-w-xs ml-auto">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span>{settings.currencySymbol} {order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Coupon Discount:</span>
              <span>- {settings.currencySymbol} {order.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Delivery:</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `${settings.currencySymbol} ${order.deliveryFee}`}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax ({settings.taxRatePercent}%):</span>
            <span>{settings.currencySymbol} {order.tax}</span>
          </div>
          <div className="pt-2 border-t border-gray-300 flex justify-between font-bold text-base text-[#07131A]">
            <span>Total:</span>
            <span>{settings.currencySymbol} {order.total}</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link
          to="/menu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#E9A817]"
        >
          <span>Order more delicious food</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
