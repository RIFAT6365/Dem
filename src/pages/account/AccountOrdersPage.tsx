/**
 * Customer Orders Page
 * Lists all orders placed by the customer with status badges, date, items, and link to details
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { ShoppingBag, ArrowRight, Eye, Calendar, Clock, DollarSign } from 'lucide-react';

export const AccountOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useRestaurant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (user?.id) {
      orderService.fetchCustomerOrders(user.id).then((data) => {
        setOrders(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.orderStatus !== 'Completed' && o.orderStatus !== 'Canceled';
    if (filter === 'completed') return o.orderStatus === 'Completed';
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E9A817]" />
            <span>My Orders ({orders.length})</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            View status, receipt details, and live delivery updates for your orders
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'active' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'completed' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading your orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-500">No orders found matching this filter.</p>
          <Link
            to="/order"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817]"
          >
            Place New Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2.5">
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-600">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <div className="font-extrabold text-base text-[#07131A]">
                    {settings.currencySymbol} {order.total}
                  </div>
                </div>
              </div>

              {/* Items summary */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-gray-600 truncate max-w-md">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/order-confirmation/${order.orderNumber}`}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    Receipt
                  </Link>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-[#07131A] text-[#F5B51B] font-bold hover:bg-black flex items-center gap-1"
                  >
                    <span>Details & Tracking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
