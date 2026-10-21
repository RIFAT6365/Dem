/**
 * Customer Account Layout
 * Provides navigation tabs for Profile, Saved Addresses, Orders, Reservations, and Security
 */

import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  ShoppingBag,
  MapPin,
  CalendarDays,
  ShieldCheck,
  LogOut,
  UtensilsCrossed,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

export const AccountLayout: React.FC = () => {
  const { user, profile, role, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Account Overview', path: '/account', icon: User, end: true },
    { label: 'My Orders', path: '/account/orders', icon: ShoppingBag, end: false },
    { label: 'Table Bookings', path: '/account/reservations', icon: CalendarDays, end: false },
    { label: 'Saved Addresses', path: '/account/addresses', icon: MapPin, end: false },
    { label: 'Edit Profile', path: '/account/profile', icon: User, end: false },
    { label: 'Security & Password', path: '/account/security', icon: KeyRound, end: false },
  ];

  const displayName = profile?.fullName || user?.user_metadata?.full_name || 'Customer';
  const displayEmail = profile?.email || user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Banner */}
      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#07131A] text-[#F5B51B] flex items-center justify-center font-bold text-2xl font-serif shadow-md shrink-0">
            {initials || 'DM'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-gray-900">{displayName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8E7] text-[#07131A] border border-[#F5B51B]/40">
                {profile?.membershipTier || 'Gold'} Member
              </span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{displayEmail}</p>
            <span className="text-[11px] text-gray-400 mt-1 block">
              {profile?.loyaltyPoints ?? 100} Royal Reward Points Available
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            to="/order"
            className="flex-grow md:flex-grow-0 px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817] text-center transition-colors"
          >
            Order New Meal
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="flex-grow md:flex-grow-0 px-4 py-2.5 rounded-xl bg-[#07131A] text-[#F5B51B] text-xs font-bold hover:bg-black text-center flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5B51B]" />
              <span>Admin Portal</span>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Container with Sidebar Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 bg-white rounded-3xl border border-[#E9E9E5] p-3 sm:p-4 shadow-sm space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Account Menu
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#F5B51B] text-[#07131A] font-bold shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </aside>

        {/* Content Outlet */}
        <main className="lg:col-span-9 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
