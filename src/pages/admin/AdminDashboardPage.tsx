import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Utensils,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  HardDrive,
  RefreshCw,
  Star,
  Check,
  XCircle,
  PackageCheck,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, OrderStatus } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const {
    orders,
    products,
    categories,
    reservations,
    customers,
    reviews,
    settings,
    isSyncing,
    refreshFromSupabase,
    supabaseStatus,
  } = useRestaurant();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Filter orders according to selected period
  const filteredOrders = useMemo(() => {
    if (period === 'all') return orders;
    const now = Date.now();
    const duration =
      period === 'today'
        ? 24 * 60 * 60 * 1000
        : period === 'week'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      const orderTime = new Date(o.createdAt).getTime();
      return !isNaN(orderTime) && now - orderTime <= duration;
    });
  }, [orders, period]);

  // Order breakdown statistics
  const nonCancelledOrders = filteredOrders.filter((o) => o.orderStatus !== 'Canceled');
  const grossSales = nonCancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const paidRevenue = nonCancelledOrders
    .filter((o) => o.paymentStatus === 'Paid' || o.orderStatus === 'Completed')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = filteredOrders.filter((o) => o.orderStatus === 'Pending').length;
  const preparingOrders = filteredOrders.filter(
    (o) => o.orderStatus === 'Confirmed' || o.orderStatus === 'Preparing'
  ).length;
  const readyOrders = filteredOrders.filter(
    (o) => o.orderStatus === 'Ready' || o.orderStatus === 'Out for Delivery'
  ).length;
  const completedOrders = filteredOrders.filter((o) => o.orderStatus === 'Completed').length;
  const cancelledOrders = filteredOrders.filter((o) => o.orderStatus === 'Canceled').length;

  // Reservations
  const upcomingReservations = reservations
    .filter((r) => r.status === 'Confirmed' || r.status === 'Pending')
    .slice(0, 4);

  // Products & Menu stats
  const availableDishes = products.filter((p) => p.isAvailable).length;
  const unavailableDishes = products.length - availableDishes;
  const bestsellingProducts = products.filter((p) => p.isBestseller).slice(0, 4);

  // Reviews
  const approvedReviews = reviews.filter((r) => r.isApproved);
  const avgRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
      : '5.0';

  // Recent 6 orders
  const recentOrders = filteredOrders.slice(0, 6);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & Supabase Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900">
              Operations & Analytics
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                supabaseStatus?.ok
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  supabaseStatus?.ok ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {supabaseStatus?.ok ? 'Supabase Live' : 'Supabase Demo Store'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time business performance connected directly to your restaurant backend database.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Manual Refresh / Supabase Sync */}
          <button
            onClick={() => refreshFromSupabase()}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-gray-700 hover:text-black hover:bg-gray-50 text-xs font-bold border border-gray-200 transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh records from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#E9A817]' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <Link
            to="/admin/drive"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors border border-blue-200 shadow-2xs"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Drive Backup</span>
          </Link>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs">
            {(['today', 'week', 'month', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg font-semibold font-sans capitalize transition-all ${
                  period === p
                    ? 'bg-[#07131A] text-[#F5B51B] shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {p === 'all' ? 'All Time' : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Paid Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">
              Paid Revenue
            </span>
            <div className="text-3xl font-bold font-sans tracking-tight text-[#07131A] mt-1 tabular-nums not-italic">
              <span className="font-sans font-bold">{settings.currencySymbol}</span>{' '}
              {paidRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-400 font-medium font-sans flex items-center gap-1 mt-1">
              Gross sales: {settings.currencySymbol} {grossSales.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#E9A817] flex items-center justify-center font-bold">
            <span className="text-xl font-bold font-sans not-italic">{settings.currencySymbol}</span>
          </div>
        </div>

        {/* Total Orders in Period */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">
              Orders ({period === 'all' ? 'Total' : period})
            </span>
            <div className="text-3xl font-bold font-sans tracking-tight text-[#07131A] mt-1 tabular-nums not-italic">
              {filteredOrders.length}
            </div>
            <span className="text-[11px] text-amber-600 font-semibold font-sans flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" /> {pendingOrders + preparingOrders} actively cooking
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">
              Customer Accounts
            </span>
            <div className="text-3xl font-bold font-sans tracking-tight text-[#07131A] mt-1 tabular-nums not-italic">
              {customers.length}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold font-sans flex items-center gap-1 mt-1">
              <Users className="w-3.5 h-3.5" /> Verified accounts
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Menu Catalog & Ratings */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">
              Menu & Rating
            </span>
            <div className="text-3xl font-bold font-sans tracking-tight text-[#07131A] mt-1 tabular-nums not-italic">
              {products.length}{' '}
              <span className="text-sm font-normal text-gray-400">dishes</span>
            </div>
            <span className="text-[11px] text-amber-500 font-semibold font-sans flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {avgRating} ({reviews.length} reviews)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Order Status Distribution Strip */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Fulfillment Pipeline Breakdown ({filteredOrders.length} orders)
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#E9A817] hover:underline flex items-center gap-1"
          >
            <span>Live Order Kanban</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <div className="text-[10px] font-bold uppercase text-amber-800">Pending Review</div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{pendingOrders}</div>
          </div>
          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/60">
            <div className="text-[10px] font-bold uppercase text-orange-800">In Kitchen</div>
            <div className="text-2xl font-bold text-orange-900 mt-1">{preparingOrders}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60">
            <div className="text-[10px] font-bold uppercase text-blue-800">Ready / In Transit</div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{readyOrders}</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
            <div className="text-[10px] font-bold uppercase text-emerald-800">Delivered / Done</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">{completedOrders}</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60">
            <div className="text-[10px] font-bold uppercase text-rose-800">Cancelled</div>
            <div className="text-2xl font-bold text-rose-900 mt-1">{cancelledOrders}</div>
          </div>
        </div>
      </div>

      {/* Main Row: Recent Orders & Upcoming Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold font-sans text-gray-900">
                Recent Customer Orders
              </h2>
              <span className="text-xs text-gray-400">
                Latest orders stored in database ({filteredOrders.length} records)
              </span>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#E9A817] hover:underline flex items-center gap-1"
            >
              <span>Manage All ({orders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 font-bold">Order #</th>
                  <th className="py-2.5 font-bold">Customer</th>
                  <th className="py-2.5 font-bold">Type</th>
                  <th className="py-2.5 font-bold">Total</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <ShoppingBag className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-600">No customer orders recorded yet.</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        As customers place orders online or via takeaway, they will appear here in real time.
                      </p>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 font-sans font-bold text-gray-900 tracking-normal not-italic">
                        #{order.orderNumber}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-gray-900">{order.customer.fullName}</div>
                        <div className="text-[10px] text-gray-400">{order.customer.area}</div>
                      </td>
                      <td className="py-3 text-gray-600">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold">
                          {order.fulfillmentType}
                        </span>
                      </td>
                      <td className="py-3 font-bold font-sans text-gray-900 tabular-nums not-italic">
                        <span className="font-sans font-bold">{settings.currencySymbol}</span>{' '}
                        {order.total}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.orderStatus === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'Ready' || order.orderStatus === 'Out for Delivery'
                              ? 'bg-blue-100 text-blue-800'
                              : order.orderStatus === 'Preparing'
                              ? 'bg-amber-100 text-amber-800'
                              : order.orderStatus === 'Canceled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to="/admin/orders"
                          className="text-[#07131A] hover:text-[#E9A817] font-bold text-xs"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold font-sans text-gray-900">
                Table Bookings
              </h3>
              <span className="text-xs text-gray-400">Upcoming guests ({reservations.length})</span>
            </div>
            <Link
              to="/admin/reservations"
              className="text-xs font-bold text-[#E9A817] hover:underline"
            >
              All →
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingReservations.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs">
                <CalendarDays className="w-7 h-7 mx-auto text-gray-300 mb-2" />
                <p className="font-medium text-gray-600">No active bookings</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Customer table reservations will show here.</p>
              </div>
            ) : (
              upcomingReservations.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">{res.customerName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      {res.status}
                    </span>
                  </div>
                  <div className="text-gray-500 text-[11px]">
                    {res.date} • {res.timeSlot} ({res.guests} Guests)
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Seating: <strong className="text-gray-700">{res.seatingPreference}</strong>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <Link
              to="/admin/reservations"
              className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold text-center block transition-colors"
            >
              Open Reservation Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Bestsellers & Quick Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bestseller Dishes */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold font-sans text-gray-900">
                Top Performing Menu Items
              </h3>
              <span className="text-xs text-gray-400">
                {availableDishes} in stock, {unavailableDishes} sold out
              </span>
            </div>
            <Link to="/admin/products" className="text-xs font-bold text-[#E9A817] hover:underline">
              Manage Menu →
            </Link>
          </div>

          {bestsellingProducts.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <Utensils className="w-7 h-7 mx-auto text-gray-300 mb-2" />
              <p className="font-medium text-gray-600">No bestselling dishes designated.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Mark popular dishes as &quot;Bestseller&quot; in the menu editor to highlight them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {bestsellingProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <img
                    src={p.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                    alt={p.name}
                    className="w-14 h-14 rounded-lg object-cover bg-gray-200 shrink-0"
                  />
                  <div className="flex-grow min-w-0">
                    <span className="font-bold text-xs text-gray-900 block leading-tight truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {p.reviewCount} reviews • {p.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="font-bold text-xs font-sans text-[#07131A] block mt-1 tabular-nums not-italic">
                      <span className="font-sans font-bold">{settings.currencySymbol}</span>{' '}
                      {p.salePrice ?? p.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-4 bg-[#07131A] text-white rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5B51B]">
            <Sparkles className="w-4 h-4" />
            <span>Fast Actions</span>
          </div>
          <h3 className="text-lg font-bold font-sans text-white leading-snug">
            Restaurant Operations
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Quickly adjust restaurant opening hours, coupon campaigns, or add new dishes to the menu.
          </p>

          <div className="space-y-2 pt-2">
            <Link
              to="/admin/products/new"
              className="w-full py-2.5 px-4 rounded-xl bg-[#F5B51B] text-[#07131A] font-bold text-xs hover:bg-[#E9A817] transition-all flex items-center justify-between shadow-sm"
            >
              <span>+ Add New Menu Item</span>
              <span>→</span>
            </Link>
            <Link
              to="/admin/offers"
              className="w-full py-2.5 px-4 rounded-xl bg-gray-800 text-gray-200 font-semibold text-xs hover:bg-gray-700 transition-all flex items-center justify-between border border-gray-700"
            >
              <span>Manage Discount Coupons ({settings.deliveryFee ? 'Active' : ''})</span>
              <span>→</span>
            </Link>
            <Link
              to="/admin/settings"
              className="w-full py-2.5 px-4 rounded-xl bg-gray-800 text-gray-200 font-semibold text-xs hover:bg-gray-700 transition-all flex items-center justify-between border border-gray-700"
            >
              <span>Update Delivery & Taxes</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
