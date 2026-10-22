import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Printer,
  Bike,
  Store,
  UtensilsCrossed,
  Filter,
  Eye,
  X,
  Phone,
  MapPin,
  Archive,
  ArchiveRestore,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, OrderStatus } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, cancelOrder, archiveOrder, unarchiveOrder, settings } = useRestaurant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [listScope, setListScope] = useState<'active' | 'archived'>('active');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [archiveTargetOrder, setArchiveTargetOrder] = useState<Order | null>(null);

  // Auto-select order if query param ?select=ORDER_ID exists
  useEffect(() => {
    const selectId = searchParams.get('select');
    if (selectId && orders.length > 0) {
      const match = orders.find(
        (o) => o.id === selectId || o.orderNumber === selectId || o.orderNumber === `#${selectId}`
      );
      if (match) {
        setSelectedOrder(match);
        if (match.isArchived) {
          setListScope('archived');
        } else {
          setListScope('active');
        }
      }
    }
  }, [searchParams, orders]);

  const activeOrdersList = orders.filter((o) => !o.isArchived);
  const archivedOrdersList = orders.filter((o) => !!o.isArchived);

  const currentScopeOrders = listScope === 'active' ? activeOrdersList : archivedOrdersList;

  const tabs = ['All', 'Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Canceled'];

  const filteredOrders = currentScopeOrders.filter((order) => {
    // Tab filter
    if (activeTab !== 'All') {
      if (activeTab === 'Completed' && (order.orderStatus === 'Completed' || (order as any).orderStatus === 'Served')) {
        // match
      } else if (order.orderStatus !== activeTab) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchCust = order.customer.fullName.toLowerCase().includes(q);
      const matchPhone = order.customer.phone.includes(q);
      if (!matchNum && !matchCust && !matchPhone) return false;
    }

    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ready':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Canceled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTargetOrder) return;
    await archiveOrder(archiveTargetOrder.id);
    if (selectedOrder?.id === archiveTargetOrder.id) {
      setSelectedOrder(null);
    }
    setArchiveTargetOrder(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900">
            Orders Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage live orders, update kitchen prep, monitor delivery dispatch, and safely archive finished orders.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Active vs Archived Segmented Control */}
          <div className="flex items-center bg-gray-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setListScope('active')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                listScope === 'active'
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#E9A817]" />
              <span>Active Orders</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-[#07131A] font-bold">
                {activeOrdersList.length}
              </span>
            </button>
            <button
              onClick={() => setListScope('archived')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                listScope === 'archived'
                  ? 'bg-white text-gray-900 shadow-xs font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-gray-500" />
              <span>Archived</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-200 text-gray-700 font-bold">
                {archivedOrdersList.length}
              </span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#07131A] text-[#F5B51B]' : 'text-gray-500 hover:text-black'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[#07131A] text-[#F5B51B]' : 'text-gray-500 hover:text-black'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const count =
                tab === 'All'
                  ? currentScopeOrders.length
                  : currentScopeOrders.filter((o) => o.orderStatus === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'bg-[#07131A] text-[#F5B51B] shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === tab ? 'bg-[#F5B51B] text-[#07131A]' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer, phone..."
              className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-xs text-gray-400">
            <UtensilsCrossed className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-gray-600">No {listScope} orders found</p>
            <p className="text-[11px] text-gray-400 mt-1">
              {listScope === 'active'
                ? 'Incoming orders from customers will appear here.'
                : 'Archived cancelled or completed orders will be listed here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrders.map((order) => {
              const isTargeted = searchParams.get('select') === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between ${
                    isTargeted ? 'border-[#F5B51B] ring-2 ring-[#F5B51B]/40' : 'border-gray-200'
                  }`}
                >
                  <div>
                    {/* Header: Customer Name, Fulfillment badge, Status */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-100 to-amber-200 text-[#07131A] font-bold text-xs flex items-center justify-center shrink-0">
                          {order.customer.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 leading-tight">
                            {order.customer.fullName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5">
                            <span className="font-semibold text-gray-700">{order.fulfillmentType}</span>
                            <span>•</span>
                            <span>
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>

                    {/* Sub-info: Order Number, Destination or Table */}
                    <div className="py-2.5 flex items-center justify-between text-xs text-gray-500 border-b border-gray-50">
                      <span className="font-sans font-bold text-[#07131A] not-italic">#{order.orderNumber}</span>
                      <span className="truncate max-w-[170px] text-[11px] text-gray-600">
                        {order.fulfillmentType === 'Dine-in'
                          ? order.tableNumber || 'Table'
                          : `${order.customer.area}`}
                      </span>
                    </div>

                    {/* Itemized food list */}
                    <div className="py-3 space-y-1.5 text-xs text-gray-700 min-h-[80px]">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="truncate max-w-[200px]">
                            <strong className="text-gray-900 font-sans font-bold">{item.quantity}</strong> × {item.name}
                          </span>
                          <span className="font-bold text-gray-900 font-sans not-italic">
                            <span className="font-sans font-bold">{settings.currencySymbol}</span> {item.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total & Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-sans">
                        Total
                      </span>
                      <span className="text-lg font-bold font-sans tracking-tight text-[#07131A] tabular-nums not-italic">
                        <span className="font-sans font-bold">{settings.currencySymbol}</span> {order.total}
                      </span>
                    </div>

                    {/* Contextual actions */}
                    <div className="grid grid-cols-2 gap-2">
                      {order.orderStatus === 'Pending' && !order.isArchived && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Preparing')}
                          className="col-span-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          <span>Start Preparing</span>
                        </button>
                      )}

                      {order.orderStatus === 'Preparing' && !order.isArchived && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Ready')}
                          className="col-span-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Ready</span>
                        </button>
                      )}

                      {order.orderStatus === 'Ready' && !order.isArchived && (
                        <button
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              order.fulfillmentType === 'Delivery' ? 'Out for Delivery' : 'Completed'
                            )
                          }
                          className="col-span-2 py-2 px-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <span>
                            {order.fulfillmentType === 'Delivery'
                              ? 'Dispatch Rider (Out for Delivery)'
                              : 'Mark Handed Over / Served'}
                          </span>
                        </button>
                      )}

                      {order.orderStatus === 'Out for Delivery' && !order.isArchived && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Completed')}
                          className="col-span-2 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed / Delivered</span>
                        </button>
                      )}

                      {/* Details button */}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      {/* Cancel / Archive / Restore action */}
                      {order.isArchived ? (
                        <button
                          onClick={() => unarchiveOrder(order.id)}
                          className="py-2 px-3 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-bold flex items-center justify-center gap-1"
                          title="Restore to active order list"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5 text-blue-600" />
                          <span>Restore</span>
                        </button>
                      ) : order.orderStatus === 'Canceled' ? (
                        <button
                          onClick={() => setArchiveTargetOrder(order)}
                          className="py-2 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center justify-center gap-1"
                          title="Safely remove from active operations list"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      ) : order.orderStatus !== 'Completed' ? (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                        >
                          Cancel Order
                        </button>
                      ) : (
                        <button
                          onClick={() => setArchiveTargetOrder(order)}
                          className="py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center gap-1"
                          title="Move completed order to archive"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archive</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-bold">Order #</th>
                <th className="p-4 font-bold">Customer</th>
                <th className="p-4 font-bold">Fulfillment</th>
                <th className="p-4 font-bold">Items</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Payment</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    No orders match current criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-sans font-bold text-gray-900 not-italic">
                      #{order.orderNumber}
                      {order.isArchived && (
                        <span className="block text-[9px] text-gray-400 uppercase font-semibold">Archived</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{order.customer.fullName}</div>
                      <div className="text-[11px] text-gray-400">{order.customer.phone}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-semibold">
                        {order.fulfillmentType}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 max-w-xs truncate">
                      {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>
                    <td className="p-4 font-bold font-sans text-gray-900 tabular-nums not-italic">
                      <span className="font-sans font-bold">{settings.currencySymbol}</span> {order.total}
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] text-gray-700 block">{order.paymentMethod}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">{order.paymentStatus}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs"
                      >
                        Inspect
                      </button>
                      {order.isArchived ? (
                        <button
                          onClick={() => unarchiveOrder(order.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                          title="Restore to active"
                        >
                          Restore
                        </button>
                      ) : (
                        (order.orderStatus === 'Canceled' || order.orderStatus === 'Completed') && (
                          <button
                            onClick={() => setArchiveTargetOrder(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs"
                            title="Remove from active view"
                          >
                            Archive
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal: Remove Order from Active List (Archive) */}
      {archiveTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Remove Order #{archiveTargetOrder.orderNumber} from Active List?
              </h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                This will soft-archive the order so it no longer clutters your active kitchen or dispatch queue.
                All transaction, audit, and customer order records remain permanently preserved in Supabase for bookkeeping and reports.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setArchiveTargetOrder(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleArchiveConfirm}
                className="px-4 py-2 rounded-xl bg-[#07131A] hover:bg-black text-[#F5B51B] text-xs font-bold shadow-md"
              >
                Yes, Remove from Active
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-500 font-sans font-semibold not-italic">
                  Invoice #{selectedOrder.orderNumber}
                </span>
                <h3 className="text-xl font-bold font-sans text-gray-900 mt-0.5 flex items-center gap-2">
                  <span>Order Details</span>
                  {selectedOrder.isArchived && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                      Archived
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  if (searchParams.get('select')) {
                    searchParams.delete('select');
                    setSearchParams(searchParams);
                  }
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient details */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
              <div>
                <span className="font-bold text-gray-400 uppercase text-[10px] block">Customer</span>
                <p className="font-bold text-gray-900 mt-0.5">{selectedOrder.customer.fullName}</p>
                <p className="text-gray-600">{selectedOrder.customer.phone}</p>
                <p className="text-gray-600">{selectedOrder.customer.email}</p>
              </div>
              <div>
                <span className="font-bold text-gray-400 uppercase text-[10px] block">Fulfillment Location</span>
                <p className="font-bold text-gray-900 mt-0.5">{selectedOrder.fulfillmentType}</p>
                {selectedOrder.fulfillmentType === 'Delivery' && (
                  <>
                    <p className="text-gray-600">{selectedOrder.customer.address}</p>
                    <p className="text-gray-600">
                      {selectedOrder.customer.area}, {selectedOrder.customer.city}
                    </p>
                  </>
                )}
                {selectedOrder.fulfillmentType === 'Dine-in' && (
                  <p className="text-gray-600">Table: {selectedOrder.tableNumber || 'Table 05'}</p>
                )}
              </div>
            </div>

            {/* Item list */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                Dishes Ordered
              </span>
              <div className="divide-y divide-gray-100 text-xs">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900">
                        {item.quantity}x {item.name}
                      </span>
                      {item.optionsSummary && (
                        <span className="text-[10px] text-gray-500 block">+ {item.optionsSummary}</span>
                      )}
                    </div>
                    <span className="font-bold font-sans text-gray-900 tabular-nums not-italic">
                      <span className="font-sans font-bold">{settings.currencySymbol}</span> {item.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status change actions */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex flex-wrap items-center justify-between gap-3">
              <span className="font-bold text-amber-900">Update Status:</span>
              <div className="flex flex-wrap gap-2">
                {(['Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Canceled'] as OrderStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, st);
                        setSelectedOrder({ ...selectedOrder, orderStatus: st });
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        selectedOrder.orderStatus === st
                          ? 'bg-[#07131A] text-[#F5B51B]'
                          : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3 flex-wrap">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Kitchen Slip</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedOrder.isArchived ? (
                  <button
                    onClick={() => {
                      unarchiveOrder(selectedOrder.id);
                      setSelectedOrder({ ...selectedOrder, isArchived: false });
                    }}
                    className="px-3.5 py-2 rounded-xl border border-gray-300 text-gray-800 text-xs font-bold hover:bg-gray-100"
                  >
                    Restore to Active
                  </button>
                ) : (
                  (selectedOrder.orderStatus === 'Canceled' || selectedOrder.orderStatus === 'Completed') && (
                    <button
                      onClick={() => {
                        setArchiveTargetOrder(selectedOrder);
                      }}
                      className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
                    >
                      Remove from Active
                    </button>
                  )
                )}
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    if (searchParams.get('select')) {
                      searchParams.delete('select');
                      setSearchParams(searchParams);
                    }
                  }}
                  className="px-6 py-2 rounded-xl bg-[#07131A] text-white text-xs font-bold hover:bg-black"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
