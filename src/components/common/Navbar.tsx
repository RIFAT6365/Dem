import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Phone,
  ShoppingBag,
  Bell,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  ChevronRight,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const Navbar: React.FC = () => {
  const { settings, navLinks, cartTotals, notifications, markNotificationRead, markAllNotificationsRead } = useRestaurant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#07131A] text-white border-b border-[#1c2c37] shadow-lg">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-[#0E1E28] via-[#152733] to-[#0E1E28] py-1.5 px-4 text-xs text-center border-b border-[#223544] flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-gray-300">
          <Clock className="w-3.5 h-3.5 text-[#F5B51B]" />
          <span>{settings.openingHours}</span>
        </div>
        <div className="mx-auto flex items-center gap-2 text-gray-200">
          <Sparkles className="w-3.5 h-3.5 text-[#F5B51B]" />
          <span>Special Offer: Free delivery on orders over {settings.currencySymbol} {settings.freeDeliveryThreshold}! Code: <strong className="text-[#F5B51B]">FREEDELIVERY</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5B51B]/15 text-[#F5B51B] border border-[#F5B51B]/30 hover:bg-[#F5B51B] hover:text-[#07131A] transition-all font-semibold"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F5B51B] to-[#E9A817] flex items-center justify-center text-[#07131A] shadow-md shadow-[#F5B51B]/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-[#F5B51B] transition-colors leading-none">
                {settings.restaurantName}
              </div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-[#F5B51B] font-semibold mt-1">
                Restaurant & Dine
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks
              .filter((item) => item.isVisible)
              .sort((a, b) => a.order - b.order)
              .map((link) => (
                <NavLink
                  key={link.id}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-[#F5B51B] relative py-1 ${
                      isActive ? 'text-[#F5B51B] font-semibold' : 'text-gray-300'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F5B51B] rounded-full animate-fadeIn" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Phone contact */}
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-[#F5B51B] transition-colors py-1.5 px-3 rounded-lg border border-gray-700/60 hover:border-[#F5B51B]/50"
            >
              <Phone className="w-3.5 h-3.5 text-[#F5B51B]" />
              <span>{settings.phone}</span>
            </a>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F5B51B] text-[#07131A] text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0E1E28] rounded-xl shadow-2xl border border-[#223544] overflow-hidden z-50">
                  <div className="p-3.5 border-b border-[#223544] flex items-center justify-between bg-[#07131A]">
                    <div className="font-semibold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#F5B51B]" />
                      <span>Notifications ({notifications.length})</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-[#F5B51B] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#1c2c37]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-xs">No notifications yet.</div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            markNotificationRead(item.id);
                            if (item.link) {
                              navigate(item.link);
                              setNotifDropdownOpen(false);
                            }
                          }}
                          className={`p-3 text-left cursor-pointer transition-colors hover:bg-[#152733] ${
                            !item.read ? 'bg-[#152733]/60' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-[#F5B51B]">{item.title}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed">{item.message}</p>
                          {item.link && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#F5B51B] mt-1 font-medium">
                              View details <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-gray-200" />
              {cartTotals.itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F5B51B] text-[#07131A] text-[10px] font-bold flex items-center justify-center">
                  {cartTotals.itemCount}
                </span>
              )}
            </Link>

            {/* Order Now CTA Button */}
            <Link
              to="/order"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-lg shadow-[#F5B51B]/20 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
              <span>Order Now</span>
            </Link>
          </div>

          {/* Mobile Menu & Cart Icon */}
          <div className="flex lg:hidden items-center gap-3">
            <Link to="/cart" className="relative p-2 text-gray-200">
              <ShoppingBag className="w-6 h-6" />
              {cartTotals.itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#F5B51B] text-[#07131A] text-[10px] font-bold flex items-center justify-center">
                  {cartTotals.itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0E1E28] border-b border-[#223544] px-4 pt-3 pb-6 animate-fadeIn">
          <div className="flex flex-col gap-2">
            {navLinks
              .filter((item) => item.isVisible)
              .sort((a, b) => a.order - b.order)
              .map((link) => (
                <NavLink
                  key={link.id}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between p-3 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-[#152733] text-[#F5B51B]' : 'text-gray-300 hover:bg-gray-800/50'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </NavLink>
              ))}

            <div className="pt-4 border-t border-[#223544] flex flex-col gap-3">
              <Link
                to="/order"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-lg bg-[#F5B51B] text-[#07131A] text-center font-bold text-sm flex items-center justify-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Order Now Online</span>
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-lg bg-gray-800 text-gray-200 text-center font-medium text-xs flex items-center justify-center gap-2 border border-gray-700"
              >
                <ShieldCheck className="w-4 h-4 text-[#F5B51B]" />
                <span>Open Restaurant Admin Dashboard</span>
              </Link>
              <a
                href={`tel:${settings.phone}`}
                className="text-xs text-center text-gray-400 py-1"
              >
                Call for inquiries: <span className="text-[#F5B51B] font-semibold">{settings.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
