import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, ShoppingBag, Eye, Calendar, X } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Customer, Order } from '../../types';

export const AdminCustomersPage: React.FC = () => {
  const { customers, orders, settings } = useRestaurant();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.customer.phone === selectedCustomer.phone ||
          o.customer.email === selectedCustomer.email ||
          o.customer.fullName === selectedCustomer.name
      )
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900">
            Customer Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Directory aggregated from customer delivery orders and dining table reservations.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-gray-200">
          Total Guests: <strong className="text-gray-900">{customers.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, area..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F5B51B]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-bold">Customer Name</th>
                <th className="p-4 font-bold">Contact Info</th>
                <th className="p-4 font-bold">Neighborhood / Area</th>
                <th className="p-4 font-bold">Total Orders</th>
                <th className="p-4 font-bold">Total Spent</th>
                <th className="p-4 font-bold">Last Activity</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#07131A] text-[#F5B51B] font-bold text-xs flex items-center justify-center shrink-0">
                        {cust.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900 block leading-tight">{cust.name}</span>
                        <span className="text-[10px] text-gray-400">Guest since {new Date(cust.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-900 font-medium">{cust.phone}</div>
                    <div className="text-[11px] text-gray-400">{cust.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-[11px]">
                      {cust.area}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                  </td>
                  <td className="p-4 font-bold font-sans text-gray-900 tabular-nums not-italic">
                    <span className="font-sans font-bold">{settings.currencySymbol}</span> {cust.totalSpent.toLocaleString()}
                  </td>
                  <td className="p-4 text-gray-500 text-[11px]">
                    {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString() : 'Reservation'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>History</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Customer Profile</span>
                <h3 className="text-xl font-bold font-sans text-gray-900 mt-0.5">
                  {selectedCustomer.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded text-gray-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs space-y-2">
              <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
              <p><strong>Email:</strong> {selectedCustomer.email}</p>
              <p><strong>Area:</strong> {selectedCustomer.area}</p>
              <p><strong>Total Spending:</strong> <span className="font-sans font-bold not-italic">{settings.currencySymbol} {selectedCustomer.totalSpent.toLocaleString()}</span></p>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold font-sans text-gray-900">
                Order Activity ({customerOrders.length})
              </h4>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-gray-400">No placed delivery orders found (guest has table reservations).</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((o) => (
                    <div key={o.id} className="p-3 rounded-xl border border-gray-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold font-sans text-gray-900 not-italic">#{o.orderNumber}</span>
                        <span className="text-[11px] text-gray-400 ml-2">{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span className="block text-[11px] text-gray-600 mt-0.5">
                          {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </span>
                      </div>
                      <span className="font-bold font-sans text-gray-900 tabular-nums not-italic">
                        <span className="font-sans font-bold">{settings.currencySymbol}</span> {o.total}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2.5 rounded-xl bg-[#07131A] text-white text-xs font-bold"
            >
              Close History
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
