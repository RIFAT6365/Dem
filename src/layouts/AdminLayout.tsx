import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  FolderTree,
  CalendarDays,
  Users,
  Star,
  TicketPercent,
  FileText,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Navigation,
  History,
  ExternalLink,
  RotateCcw,
  Menu,
  X,
  Bell,
  UtensilsCrossed,
  Search,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  LogOut,
  Volume2,
  Trash2,
  CheckCheck,
  Database,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { ToastContainer } from '../components/common/ToastContainer';

export const AdminLayout: React.FC = () => {
  const {
    settings,
    orders,
    resetDemoData,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    refreshFromSupabase,
    isSyncing,
    isBackendConnected,
    playNotificationSound,
    showToast,
  } = useRestaurant();
  const { user, profile, signOut, demoAdminActive, setDemoAdminMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'order' | 'reservation' | 'promo'>('all');
  const navigate = useNavigate();
  const location = useLocation();

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === 'all') return true;
    return n.type === notifFilter;
  });

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Live Orders', path: '/admin/orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { label: 'Food Menu', path: '/admin/products', icon: Utensils },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Reservations', path: '/admin/reservations', icon: CalendarDays },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Coupons & Deals', path: '/admin/offers', icon: TicketPercent },
    { label: 'Homepage Content', path: '/admin/content', icon: FileText },
    { label: 'Photo Gallery', path: '/admin/gallery', icon: ImageIcon },
    { label: 'Google Drive Sync', path: '/admin/drive', icon: HardDrive },
    { label: 'Restaurant Settings', path: '/admin/settings', icon: SettingsIcon },
    { label: 'Navigation Menu', path: '/admin/navigation', icon: Navigation },
    { label: 'Activity Audit Log', path: '/admin/activity', icon: History },
  ];

  const handleReset = () => {
    resetDemoData();
    setResetConfirmOpen(false);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#07131A] text-white border-r border-[#152733] shrink-0 sticky top-0 h-screen">
        {/* Brand header */}
        <div className="p-5 border-b border-[#152733] flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5B51B] to-[#E9A817] flex items-center justify-center text-[#07131A] font-bold shadow-md shadow-[#F5B51B]/20">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-sans font-bold text-base text-white tracking-wide block leading-none">
                {settings.restaurantName}
              </span>
              <span className="text-[10px] text-[#F5B51B] font-semibold uppercase tracking-wider block mt-1">
                Admin Manager
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Operations & Catalog
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isExact = item.path === '/admin';
            const isActive = isExact
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={isExact}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#F5B51B] text-[#07131A] font-bold shadow-md shadow-[#F5B51B]/20'
                    : 'text-gray-300 hover:text-white hover:bg-[#0E1E28]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#07131A]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-sans tabular-nums not-italic ${
                      isActive ? 'bg-[#07131A] text-white' : 'bg-[#F5B51B] text-[#07131A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#152733] bg-[#0A1821] space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#152733] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#F5B51B]" />
              <span>Public Website</span>
            </span>
            <span className="text-[10px] text-gray-400">Preview ↗</span>
          </Link>

          <button
            onClick={() => setResetConfirmOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors border border-red-900/40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Demo Mode • Persistent LocalStorage</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/products/new"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#07131A] text-[#F5B51B] text-xs font-bold hover:bg-black transition-colors"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>+ Add Product</span>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#07131A] font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#F5B51B]" />
              <span className="hidden md:inline">View Website</span>
            </Link>

            {/* Profile Avatar & Sign Out */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#F5B51B] to-[#E9A817] text-[#07131A] flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.email?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-bold text-gray-800 leading-tight">
                  {profile?.fullName || user?.email?.split('@')[0] || 'Administrator'}
                </span>
                <span className="block text-[10px] text-gray-500">
                  {demoAdminActive ? 'Demo Admin Mode' : user?.email || 'Authorized Staff'}
                </span>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/admin/login');
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign Out of Admin Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-grow max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 max-w-[80vw] bg-[#07131A] text-white flex flex-col h-full z-10 shadow-2xl">
            <div className="p-4 border-b border-[#152733] flex items-center justify-between">
              <span className="font-sans font-bold text-sm text-[#F5B51B]">
                {settings.restaurantName} Admin
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-grow overflow-y-auto px-3 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isExact = item.path === '/admin';
                const isActive = isExact
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={isExact}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                      isActive
                        ? 'bg-[#F5B51B] text-[#07131A] font-bold'
                        : 'text-gray-300 hover:bg-[#0E1E28]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-sans tabular-nums not-italic bg-[#07131A] text-white">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
            <div className="p-3 border-t border-[#152733]">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setResetConfirmOpen(true);
                }}
                className="w-full py-2 rounded-lg bg-red-950/40 text-red-300 text-xs text-center border border-red-900/40"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reset All Demo Data?</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              This will restore all products, orders, categories, reservations, reviews, coupons, and restaurant settings back to the initial sample state. All recent changes in local storage will be cleared.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};
