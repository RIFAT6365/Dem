/**
 * Account Overview Page
 * Displays quick stats, active orders, upcoming table reservations, and recent orders
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { orderService } from '../../services/orderService';
import { reservationService } from '../../services/reservationService';
import { Order, Reservation } from '../../types';
import {
  ShoppingBag,
  CalendarDays,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export const AccountOverviewPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { settings } = useRestaurant();
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [customerReservations, setCustomerReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        orderService.fetchCustomerOrders(user.id),
        reservationService.fetchCustomerReservations(user.id),
      ]).then(([orders, reservations]) => {
        setCustomerOrders(orders);
        setCustomerReservations(reservations);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const activeOrders = customerOrders.filter(
    (o) => o.orderStatus !== 'Completed' && o.orderStatus !== 'Canceled'
  );
  const totalSpent = customerOrders
    .filter((o) => o.orderStatus !== 'Canceled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E9E9E5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{customerOrders.length}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">Lifetime orders placed</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9E9E5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Active Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {customerReservations.filter((r) => r.status === 'Confirmed' || r.status === 'Pending').length}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Upcoming dining reservations</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E9E9E5] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Spent</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="font-bold text-sm">{settings.currencySymbol}</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {settings.currencySymbol} {totalSpent}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">In completed & verified orders</div>
        </div>
      </div>

      {/* Active Live Orders Notice */}
      {activeOrders.length > 0 && (
        <div className="bg-[#FFF8E7] rounded-3xl border border-[#F5B51B]/40 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#07131A]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E9A817] animate-ping" />
              <span>You have {activeOrders.length} active order in progress!</span>
            </div>
            <Link
              to={`/account/orders/${activeOrders[0].id}`}
              className="text-xs font-bold text-[#07131A] hover:underline flex items-center gap-1"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-gray-700">
            Order <strong>#{activeOrders[0].orderNumber}</strong> is currently{' '}
            <span className="px-2 py-0.5 rounded-full bg-white font-bold text-[#07131A] border border-[#F5B51B]/40">
              {activeOrders[0].orderStatus}
            </span>
            . Estimated arrival: {activeOrders[0].estimatedDeliveryMinutes || 35} mins.
          </p>
        </div>
      )}

      {/* Recent Orders Table Card */}
      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E9A817]" />
            <span>Recent Orders</span>
          </h2>
          <Link
            to="/account/orders"
            className="text-xs font-bold text-[#E9A817] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading your order history...</div>
        ) : customerOrders.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-xs text-gray-500">No orders placed yet with this account.</p>
            <Link
              to="/order"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817]"
            >
              Browse Food Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {customerOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">#{order.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      order.orderStatus === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'Canceled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-[#FFF8E7] text-[#07131A] border border-[#F5B51B]/40'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div className="text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items • {order.fulfillmentType}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="font-extrabold text-sm text-[#07131A]">
                    {settings.currencySymbol} {order.total}
                  </div>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
