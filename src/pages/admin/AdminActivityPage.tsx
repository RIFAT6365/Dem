import React, { useState } from 'react';
import { History, ShoppingBag, Utensils, CalendarDays, Tag, Settings, Star, Filter } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ActivityLog } from '../../types';

export const AdminActivityPage: React.FC = () => {
  const { activityLogs } = useRestaurant();
  const [filterCat, setFilterCat] = useState<string>('all');

  const filtered = activityLogs.filter((log) => {
    if (filterCat !== 'all' && log.category !== filterCat) return false;
    return true;
  });

  const getCategoryIcon = (cat: ActivityLog['category']) => {
    switch (cat) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-blue-600" />;
      case 'product':
        return <Utensils className="w-4 h-4 text-emerald-600" />;
      case 'reservation':
        return <CalendarDays className="w-4 h-4 text-purple-600" />;
      case 'coupon':
        return <Tag className="w-4 h-4 text-amber-600" />;
      case 'review':
        return <Star className="w-4 h-4 text-[#F5B51B]" />;
      default:
        return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl font-bold text-gray-900 not-italic">
            System Activity & Audit Log
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Local demo event log recording order placements, kitchen updates, and catalog changes.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'order', 'product', 'reservation', 'coupon', 'settings'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterCat === cat
                  ? 'bg-[#07131A] text-[#F5B51B]'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center">No recent activity matching filter.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3.5 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(log.category)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">{log.action}</span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
