import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  User,
  LogOut,
  ChevronDown,
  ShoppingBag as OrderIcon,
  CheckCheck,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { settings, navLinks, cartTotals, notifications, markNotificationRead, markAllNotificationsRead } = useRestaurant();
  const { user, profile, isAuthenticated, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Authenticated customer display name (fallback to RIFAT or Customer)
  const customerDisplayName = profile?.fullName?.trim() || user?.email?.split('@')[0] || 'RIFAT';

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotifDropdownOpen(false);
        setAccountDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdowns and mobile menu on navigation
  useEffect(() => {
    setNotifDropdownOpen(false);
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Standard ordered navigation items:
  // Home | Menu | About Us | Gallery | Reviews | Reservations | Offers | Track Order | Contact
  const orderedNavLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'About Us', path: '/about' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Reviews', path: '/reviews' },
    { label: 'Reservations', path: '/reservations' },
    { label: 'Offers', path: '/offers' },
    { label: 'Track Order', path: '/track-order' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#07131A] text-white border-b border-[#1c2c37] shadow-lg">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-[#0E1E28] via-[#152733] to-[#0E1E28] py-1.5 px-4 text-xs text-center border-b border-[#223544] flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-gray-300">
          <Clock className="w-3.5 h-3.5 text-[#F5B51B]" />
          <span>{settings.openingHours}</span>
        </div>
        <div className="mx-auto flex items-center gap-2 text-gray-200 text-[11px] sm:text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F5B51B]" />
          <span>Special Offer: Free delivery over {settings.currencySymbol} {settings.freeDeliveryThreshold}! Code: <strong className="text-[#F5B51B]">FREEDELIVERY</strong></span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5B51B]/15 text-[#F5B51B] border border-[#F5B51B]/30 hover:bg-[#F5B51B] hover:text-[#07131A] transition-all font-semibold text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          ) : (
            <a
              href={`tel:${settings.phone}`}
              className="hidden md:flex items-center gap-1.5 text-gray-300 hover:text-[#F5B51B] text-xs font-semibold transition-colors"
            >
              <Phone className="w-3 h-3 text-[#F5B51B]" />
              <span>{settings.phone}</span>
            </a>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* Brand Logo on Left */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#F5B51B] to-[#E9A817] flex items-center justify-center text-[#07131A] shadow-md shadow-[#F5B51B]/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#F5B51B] transition-colors leading-none">
                {settings.restaurantName}
              </div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#F5B51B] font-semibold mt-1">
                Restaurant & Dine
              </div>
            </div>
          </Link>

          {/* Desktop Navigation: Horizontal links centrally placed */}
          <nav className="hidden lg:flex items-center justify-center gap-3 xl:gap-5 2xl:gap-6 flex-1 px-2">
            {orderedNavLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-[13px] xl:text-sm font-medium transition-colors hover:text-[#F5B51B] relative py-1 whitespace-nowrap ${
                    isActive ? 'text-[#F5B51B] font-bold' : 'text-gray-300'
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

          {/* Right Action Group: Notification, Account Dropdown, ONE Cart Icon, and Order CTA */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Real-Time Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setAccountDropdownOpen(false);
                }}
                className="relative p-2 sm:p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-[#F5B51B]"
                title="Notifications"
                aria-label="View notifications"
                aria-expanded={notifDropdownOpen}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#F5B51B] text-[#07131A] text-[10px] font-bold flex items-center justify-center font-sans">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0E1E28] rounded-2xl shadow-2xl border border-[#223544] overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3.5 border-b border-[#223544] flex items-center justify-between bg-[#07131A]">
                    <div className="font-semibold text-xs sm:text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#F5B51B]" />
                      <span>Notifications ({notifications.length})</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-[#F5B51B] hover:underline font-semibold flex items-center gap-1"
                      >
                        <CheckCheck className="w-3 h-3" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#1c2c37]">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-xs">
                        <Bell className="w-6 h-6 mx-auto mb-2 opacity-30 text-gray-400" />
                        <span>No notifications yet. Place an order or make a reservation to see live updates.</span>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            markNotificationRead(item.id);
                            if (item.link) {
                              navigate(item.link);
                              setNotifDropdownOpen(false);
                            }
                          }}
                          className={`p-3.5 text-left cursor-pointer transition-colors hover:bg-[#152733] ${
                            !item.read ? 'bg-[#152733]/70 border-l-2 border-[#F5B51B]' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-[#F5B51B] leading-tight">{item.title}</span>
                            <span className="text-[10px] text-gray-400 font-sans">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed">{item.message}</p>
                          {item.link && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#F5B51B] mt-1.5 font-medium">
                              Open details <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Exactly ONE Shopping Cart Icon across ALL viewports */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center p-2 sm:p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-[#F5B51B]"
              title="Shopping Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-gray-200" />
              {cartTotals.itemCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#F5B51B] text-[#07131A] text-[10px] font-bold flex items-center justify-center font-sans animate-scaleIn">
                  {cartTotals.itemCount}
                </span>
              )}
            </Link>

            {/* Customer Account Dropdown */}
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => {
                  setAccountDropdownOpen(!accountDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-gray-800/60 transition-colors border border-gray-700/60 focus:outline-none focus:ring-1 focus:ring-[#F5B51B]"
                title="Account menu"
                aria-label="User account menu"
                aria-expanded={accountDropdownOpen}
              >
                <User className="w-4 h-4 text-[#F5B51B]" />
                <span className="hidden sm:inline font-bold">
                  {isAuthenticated ? customerDisplayName : 'Sign In'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Account Dropdown Menu */}
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0E1E28] rounded-2xl shadow-2xl border border-[#223544] overflow-hidden z-50 animate-fadeIn py-1.5 text-xs">
                  {/* 1. My Account (Authenticated Customer Name) */}
                  <Link
                    to={isAuthenticated ? '/account' : '/login'}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#152733] text-gray-200 hover:text-white transition-colors border-b border-[#1c2c37]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#F5B51B]/20 text-[#F5B51B] flex items-center justify-center font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold block text-white">
                          My Account ({customerDisplayName})
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {isAuthenticated ? user?.email : 'Sign in to access orders & perks'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  {/* 2. Order Now Online */}
                  <Link
                    to="/order"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#152733] text-gray-200 hover:text-[#F5B51B] transition-colors font-medium"
                  >
                    <OrderIcon className="w-4 h-4 text-[#F5B51B]" />
                    <span>Order Now Online</span>
                  </Link>

                  {/* 3. Open Restaurant Admin Dashboard (Authorized Administrators Only) */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#152733] text-[#F5B51B] font-semibold transition-colors border-t border-b border-[#1c2c37] bg-[#F5B51B]/5"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#F5B51B]" />
                      <span>Open Restaurant Admin Dashboard</span>
                    </Link>
                  )}

                  {/* 4. Call for Inquiries */}
                  <a
                    href={`tel:${settings.phone}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#152733] text-gray-300 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#F5B51B]" />
                    <span>Call for Inquiries: <strong className="text-white font-sans">{settings.phone}</strong></span>
                  </a>

                  {/* Sign Out Option if authenticated */}
                  {isAuthenticated && (
                    <div className="pt-1 mt-1 border-t border-[#1c2c37]">
                      <button
                        onClick={async () => {
                          await signOut();
                          setAccountDropdownOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-950/30 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop CTA: Order Now */}
            <Link
              to="/order"
              className="hidden md:flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] text-xs xl:text-sm font-bold tracking-wide transition-all shadow-md shadow-[#F5B51B]/20 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
              <span>Order Now</span>
            </Link>

            {/* Mobile Hamburger Toggle Only (No duplicate cart icon here!) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none focus:ring-1 focus:ring-[#F5B51B]"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0E1E28] border-b border-[#223544] px-4 pt-3 pb-6 animate-fadeIn">
          <div className="flex flex-col gap-1.5">
            {orderedNavLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between p-3 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-[#152733] text-[#F5B51B] font-bold' : 'text-gray-300 hover:bg-gray-800/50'
                  }`
                }
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </NavLink>
            ))}

            <div className="pt-4 border-t border-[#223544] flex flex-col gap-2.5">
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#152733] text-white text-center font-bold text-xs flex items-center justify-center gap-2 border border-gray-700"
              >
                <User className="w-4 h-4 text-[#F5B51B]" />
                <span>My Account ({customerDisplayName})</span>
              </Link>

              <Link
                to="/order"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-[#F5B51B] text-[#07131A] text-center font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#F5B51B]/20"
              >
                <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
                <span>Order Now Online</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#07131A] text-[#F5B51B] text-center font-bold text-xs flex items-center justify-center gap-2 border border-[#F5B51B]/40"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F5B51B]" />
                  <span>Open Restaurant Admin Dashboard</span>
                </Link>
              )}

              <a
                href={`tel:${settings.phone}`}
                className="text-xs text-center text-gray-400 py-1"
              >
                Call for Inquiries: <span className="text-[#F5B51B] font-bold font-sans">{settings.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
