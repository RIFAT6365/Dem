import React, { useState } from 'react';
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
  ChevronRight,
  Sparkles,
  HardDrive,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const AdminDashboardPage: React.FC = () => {
  const { orders, products, reservations, customers, settings } = useRestaurant();
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Real metrics derived from stored state
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length;
  const completedOrders = orders.filter((o) => o.orderStatus === 'Completed').length;
  const confirmedReservations = reservations.filter((r) => r.status === 'Confirmed' || r.status === 'Pending').length;

  // Recent 5 orders
  const recentOrders = orders.slice(0, 5);

  // Upcoming 4 reservations
  const upcomingReservations = reservations.slice(0, 4);

  // Bestsellers
  const bestsellingProducts = products.filter((p) => p.isBestseller).slice(0, 4);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900">
            Restaurant Operations Overview
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time business performance derived from persistent demo records.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/drive"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold font-sans transition-colors border border-blue-200 shadow-2xs"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Drive Backup</span>
          </Link>

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

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">
              Total Revenue
            </span>
            <div className="text-3xl font-bold font-sans tracking-tight text-[#07131A] mt-1 tabular-nums not-italic">
              <span className="font-sans font-bold">{settings.currencySymbol}</span> {totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold font-sans flex items-center gap-1 mt-1 not-italic">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% from last week
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#E9A817] flex items-center justify-center font-bold">
            <span className="text-xl font-bold font-sans not-italic">{settings.currencySymbol}</span>
          </div>
        </div>

        {/* Live Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">
              Orders In Progress
            </span>
            <div className="text-3xl font-bold font-sans tracking-tight text-[#07131A] mt-1 tabular-nums not-italic">
              {pendingOrders}
            </div>
            <span className="text-[11px] text-amber-600 font-semibold font-sans flex items-center gap-1 mt-1 not-italic">
              <Clock className="w-3.5 h-3.5" /> Kitchen queue active
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Menu Dishes */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">
              Active Menu Dishes
            </span>
            <div className="text-3xl font-bold font-sans tracking-tight text-[#07131A] mt-1 tabular-nums not-italic">
              {products.length}
            </div>
            <span className="text-[11px] text-gray-500 font-semibold font-sans flex items-center gap-1 mt-1 not-italic">
              Across {bestsellingProducts.length} bestsellers
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        {/* Table Reservations */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 font-sans">
              Upcoming Bookings
            </span>
            <div className="text-3xl font-bold font-sans tracking-tight text-[#07131A] mt-1 tabular-nums not-italic">
              {confirmedReservations}
            </div>
            <span className="text-[11px] text-purple-600 font-semibold font-sans flex items-center gap-1 mt-1 not-italic">
              <Users className="w-3.5 h-3.5" /> {reservations.reduce((acc, r) => acc + r.guests, 0)} guests total
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
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
              <span className="text-xs text-gray-400">Latest incoming orders and fulfillment status</span>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#E9A817] hover:underline flex items-center gap-1"
            >
              <span>Manage All Orders ({orders.length})</span>
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
                {recentOrders.map((order) => (
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
                      <span className="font-sans font-bold">{settings.currencySymbol}</span> {order.total}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'Ready'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'Preparing'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
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
                ))}
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
              <span className="text-xs text-gray-400">Upcoming guests</span>
            </div>
            <Link
              to="/admin/reservations"
              className="text-xs font-bold text-[#E9A817] hover:underline"
            >
              All →
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingReservations.map((res) => (
              <div key={res.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1">
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
            ))}
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
            <h3 className="text-base font-bold font-sans text-gray-900">
              Top Performing Menu Items
            </h3>
            <Link to="/admin/products" className="text-xs font-bold text-[#E9A817] hover:underline">
              Manage Menu →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bestsellingProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-14 h-14 rounded-lg object-cover bg-gray-200 shrink-0"
                />
                <div className="flex-grow">
                  <span className="font-bold text-xs text-gray-900 block leading-tight">{p.name}</span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{p.reviewCount} customer orders</span>
                  <span className="font-bold text-xs font-sans text-[#07131A] block mt-1 tabular-nums not-italic">
                    <span className="font-sans font-bold">{settings.currencySymbol}</span> {p.salePrice ?? p.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="lg:col-span-4 bg-[#07131A] text-white rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F5B51B]">
            <Sparkles className="w-4 h-4" />
            <span>Fast Actions</span>
          </div>
          <h3 className="text-lg font-bold font-sans text-white leading-snug">
            Manage Daily Store Operations
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Quickly adjust restaurant opening hours, promo coupons, or add new chef specials.
          </p>

          <div className="space-y-2 pt-2">
            <Link
              to="/admin/products/new"
              className="w-full py-2.5 px-4 rounded-xl bg-[#F5B51B] text-[#07131A] font-bold text-xs hover:bg-[#E9A817] transition-all flex items-center justify-between"
            >
              <span>+ Add New Menu Item</span>
              <span>→</span>
            </Link>
            <Link
              to="/admin/offers"
              className="w-full py-2.5 px-4 rounded-xl bg-gray-800 text-gray-200 font-semibold text-xs hover:bg-gray-700 transition-all flex items-center justify-between border border-gray-700"
            >
              <span>Manage Discount Coupons</span>
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
