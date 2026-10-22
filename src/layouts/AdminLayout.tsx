import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
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
    supabaseStatus,
    playNotificationSound,
  } = useRestaurant();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'order' | 'reservation' | 'review'>('all');
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef<HTMLDivElement>(null);

  const pendingOrdersCount = orders.filter((o) => !o.isArchived && (o.orderStatus === 'Pending' || o.orderStatus === 'Preparing')).length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  // Escape key handler for drawers and popovers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setNotifOpen(false);
        setResetConfirmOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Outside click listener for notification popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const filteredNotifs = notifications.filter((n) => {
    if (notifFilter === 'all') return true;
    return n.type === notifFilter;
  });

  const handleNotificationClick = (n: any) => {
    markNotificationRead(n.id);
    setNotifOpen(false);

    if (n.link) {
      navigate(n.link);
      return;
    }

    if (n.type === 'order') {
      navigate(n.entityId ? `/admin/orders?select=${encodeURIComponent(n.entityId)}` : '/admin/orders');
    } else if (n.type === 'reservation') {
      navigate(n.entityId ? `/admin/reservations?select=${encodeURIComponent(n.entityId)}` : '/admin/reservations');
    } else if (n.type === 'review') {
      navigate(n.entityId ? `/admin/reviews?select=${encodeURIComponent(n.entityId)}` : '/admin/reviews');
    }
  };

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
      {/* Sidebar for Desktop with Collapse/Expand Toggle */}
      <aside
        className={`hidden lg:flex flex-col bg-[#07131A] text-white border-r border-[#152733] shrink-0 sticky top-0 h-screen transition-all duration-300 ease-in-out z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand header */}
        <div className="p-4 border-b border-[#152733] flex items-center justify-between">
          <Link
            to="/admin"
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
            title={settings.restaurantName}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5B51B] to-[#E9A817] flex items-center justify-center text-[#07131A] font-bold shadow-md shadow-[#F5B51B]/20 shrink-0">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-sans font-bold text-sm text-white tracking-wide block truncate leading-none">
                  {settings.restaurantName}
                </span>
                <span className="text-[10px] text-[#F5B51B] font-semibold uppercase tracking-wider block mt-1">
                  Admin Manager
                </span>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#152733] transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand toggle button */}
        {isCollapsed && (
          <div className="py-2 flex justify-center border-b border-[#152733]">
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-lg text-[#F5B51B] hover:text-white hover:bg-[#152733] transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-grow overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin">
          {!isCollapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Operations & Catalog
            </div>
          )}
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
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-xs font-medium transition-all relative group ${
                  isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#F5B51B] text-[#07131A] font-bold shadow-md shadow-[#F5B51B]/20'
                    : 'text-gray-300 hover:text-white hover:bg-[#0E1E28]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#07131A]' : 'text-gray-400 group-hover:text-white'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full text-[10px] font-bold font-sans tabular-nums not-italic ${
                      isCollapsed
                        ? 'absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-[#F5B51B] text-[#07131A]'
                        : `px-2 py-0.5 ${isActive ? 'bg-[#07131A] text-white' : 'bg-[#F5B51B] text-[#07131A]'}`
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
        <div className="p-2 border-t border-[#152733] bg-[#0A1821] space-y-1">
          <Link
            to="/"
            target="_blank"
            title={isCollapsed ? 'Public Website' : undefined}
            className={`flex items-center rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#152733] transition-colors ${
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
            }`}
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#F5B51B]" />
              {!isCollapsed && <span>Public Website</span>}
            </span>
            {!isCollapsed && <span className="text-[10px] text-gray-400">Preview ↗</span>}
          </Link>

          <button
            onClick={() => setResetConfirmOpen(true)}
            title={isCollapsed ? 'Reset Demo Data' : undefined}
            className={`w-full flex items-center justify-center gap-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors border border-red-900/40 ${
              isCollapsed ? 'p-2.5' : 'px-3 py-2'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span>Reset Demo Data</span>}
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
              aria-label="Open sidebar drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => refreshFromSupabase()}
              disabled={isSyncing}
              className="hidden sm:flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Real-time multi-tab sync active. Click to force instant cloud refresh."
            >
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span>{isSyncing ? 'Syncing Cloud...' : 'Real-time Live • Auto-Sync'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/admin/products/new"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#07131A] text-[#F5B51B] text-xs font-bold hover:bg-black transition-colors"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>+ Add Product</span>
            </Link>

            <Link
              to="/"
              className="hidden md:flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#07131A] font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#F5B51B]" />
              <span>View Website</span>
            </Link>

            {/* Admin Notification Center Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative p-2 rounded-xl border transition-colors ${
                  notifOpen
                    ? 'bg-[#07131A] text-[#F5B51B] border-[#07131A]'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
                title="Restaurant Notifications & Real-Time Alerts"
                aria-label="Notification center"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadNotifs > 99 ? '99+' : unreadNotifs}
                  </span>
                )}
              </button>

              {/* Notification Popover Panel */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn">
                  {/* Popover Header */}
                  <div className="p-3.5 bg-[#07131A] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#F5B51B]" />
                      <span className="font-bold text-xs">Admin Notifications</span>
                      {unreadNotifs > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#F5B51B] text-[#07131A] text-[10px] font-bold">
                          {unreadNotifs} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => playNotificationSound()}
                        className="p-1 rounded text-gray-400 hover:text-white"
                        title="Test sound alert"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      {unreadNotifs > 0 && (
                        <button
                          onClick={() => markAllNotificationsRead()}
                          className="text-[10px] text-[#F5B51B] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="p-2 bg-gray-50 border-b border-gray-100 flex items-center gap-1 text-[11px] overflow-x-auto">
                    {(['all', 'order', 'reservation', 'review'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setNotifFilter(f)}
                        className={`px-2.5 py-1 rounded-lg font-semibold capitalize whitespace-nowrap transition-colors ${
                          notifFilter === f
                            ? 'bg-[#07131A] text-[#F5B51B]'
                            : 'text-gray-600 hover:bg-gray-200/60'
                        }`}
                      >
                        {f === 'all' ? 'All' : `${f}s`}
                      </button>
                    ))}
                  </div>

                  {/* Notifications list */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {filteredNotifs.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400">
                        <Sparkles className="w-6 h-6 mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-600">No notifications yet</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          New orders, reservations, and customer reviews will appear here.
                        </p>
                      </div>
                    ) : (
                      filteredNotifs.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 transition-colors flex items-start gap-3 hover:bg-gray-50 cursor-pointer ${
                            !n.read ? 'bg-amber-50/50' : ''
                          }`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                              n.type === 'order'
                                ? 'bg-amber-100 text-[#07131A]'
                                : n.type === 'reservation'
                                ? 'bg-blue-100 text-blue-800'
                                : n.type === 'review'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {n.type === 'order' ? (
                              <ShoppingBag className="w-3.5 h-3.5" />
                            ) : n.type === 'reservation' ? (
                              <CalendarDays className="w-3.5 h-3.5" />
                            ) : n.type === 'review' ? (
                              <Star className="w-3.5 h-3.5 fill-emerald-600" />
                            ) : (
                              <Bell className="w-3.5 h-3.5" />
                            )}
                          </div>

                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-gray-900 truncate">
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-[#F5B51B] shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-gray-400 block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="p-1 rounded text-gray-300 hover:text-red-600 hover:bg-red-50 shrink-0"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Popover Footer */}
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">{notifications.length} total alerts</span>
                      <button
                        onClick={() => clearAllNotifications()}
                        className="text-red-600 hover:underline font-semibold"
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

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
                  {user?.email || 'Administrator (Verified)'}
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

      {/* Mobile Sidebar Off-Canvas Drawer with Escape Dismissal */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-[#07131A] text-white flex flex-col h-full z-10 shadow-2xl animate-fadeIn">
            <div className="p-4 border-b border-[#152733] flex items-center justify-between">
              <span className="font-sans font-bold text-sm text-[#F5B51B]">
                {settings.restaurantName} Admin
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-white"
                title="Close sidebar (Esc)"
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
