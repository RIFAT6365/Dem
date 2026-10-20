import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  CalendarDays,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const AccountPage: React.FC = () => {
  const { orders, reservations, settings } = useRestaurant();

  const userProfile = {
    name: 'Tanvir Rahman',
    email: 'tanvir.rahman@example.com',
    phone: '+880 1711 223344',
    memberSince: 'January 2026',
    loyaltyPoints: 340,
    primaryAddress: 'House 42, Road 7/A, Dhanmondi R/A, Dhaka',
  };

  return (
    <div className="py-12 space-y-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#07131A] text-[#F5B51B] flex items-center justify-center font-bold text-2xl font-serif shadow-md">
            TR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-gray-900">{userProfile.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8E7] text-[#07131A] border border-[#F5B51B]/40">
                Gold Member
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{userProfile.phone} • {userProfile.email}</p>
            <span className="text-[11px] text-gray-400 mt-1 block">
              Member Since {userProfile.memberSince} • {userProfile.loyaltyPoints} Royal Points
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            to="/order"
            className="flex-grow md:flex-grow-0 px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817] text-center"
          >
            Order New Meal
          </Link>
          <Link
            to="/admin"
            className="flex-grow md:flex-grow-0 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-800 text-xs font-semibold hover:bg-gray-200 text-center flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#E9A817]" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#E9A817]" />
              <span>Your Order History</span>
            </h2>
            <span className="text-xs font-semibold text-gray-500">{orders.length} orders total</span>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">#{order.orderNumber}</span>
                    <span className="text-gray-400 ml-2">
                      {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold self-start sm:self-auto ${
                    order.orderStatus === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.orderStatus === 'Canceled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-[#FFF8E7] text-[#07131A] border border-[#F5B51B]/40'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="text-xs text-gray-600 divide-y divide-gray-50">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-1 flex justify-between">
                      <span>{item.quantity}× {item.name}</span>
                      <span className="font-bold text-gray-800">{settings.currencySymbol} {item.total}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">
                    Total: {settings.currencySymbol} {order.total} ({order.fulfillmentType})
                  </span>
                  <Link
                    to={`/track-order?id=${order.orderNumber}`}
                    className="text-[#E9A817] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Track Live Progress</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Reservations & Address */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reservations */}
          <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <CalendarDays className="w-4 h-4 text-[#E9A817]" />
              <span>Table Bookings</span>
            </h3>

            {reservations.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No active table bookings.</p>
            ) : (
              <div className="space-y-3">
                {reservations.slice(0, 3).map((res) => (
                  <div key={res.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Ref #{res.referenceNumber}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {res.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{res.date} at {res.timeSlot}</p>
                    <p className="text-gray-500 text-[11px]">{res.guests} Guests • {res.seatingPreference}</p>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/reservations"
              className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 text-center block"
            >
              Book New Table
            </Link>
          </div>

          {/* Saved Address */}
          <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 shadow-sm space-y-3 text-xs">
            <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-[#E9A817]" />
              <span>Saved Delivery Address</span>
            </h3>
            <p className="font-bold text-gray-900">Default Home Address</p>
            <p className="text-gray-600 leading-relaxed">{userProfile.primaryAddress}</p>
            <p className="text-[11px] text-gray-500">Contact: {userProfile.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
