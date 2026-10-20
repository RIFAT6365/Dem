import React, { useState } from 'react';
import { Plus, Tag, Edit, Trash2, Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Coupon } from '../../types';

export const AdminOffersPage: React.FC = () => {
  const { coupons, settings, addCoupon, updateCoupon, deleteCoupon } = useRestaurant();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState(50);
  const [minOrderValue, setMinOrderValue] = useState(300);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined);
  const [validFrom, setValidFrom] = useState('2026-06-12');
  const [validTo, setValidTo] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState(100);
  const [isActive, setIsActive] = useState(true);

  const openAddModal = () => {
    setEditingCoupon(null);
    setName('');
    setCode('');
    setDiscountType('fixed');
    setDiscountValue(50);
    setMinOrderValue(300);
    setMaxDiscount(undefined);
    setValidFrom(new Date().toISOString().split('T')[0]);
    setValidTo('2026-12-31');
    setUsageLimit(50);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setName(c.name);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderValue(c.minOrderValue);
    setMaxDiscount(c.maxDiscount);
    setValidFrom(c.validFrom);
    setValidTo(c.validTo);
    setUsageLimit(c.usageLimit);
    setIsActive(c.isActive);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        validFrom,
        validTo,
        usageLimit: Number(usageLimit),
        isActive,
      });
    } else {
      addCoupon({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        validFrom,
        validTo,
        usageLimit: Number(usageLimit),
        isActive,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header (Matching Reference Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900">
            Coupon Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure promotional voucher codes, minimum order criteria, and discount values.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add New Coupon</span>
        </button>
      </div>

      {/* Coupons Table (Faithfully matching Image 1 format) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-bold">Name</th>
                <th className="p-4 font-bold">Code</th>
                <th className="p-4 font-bold">Price / Value</th>
                <th className="p-4 font-bold">Active From</th>
                <th className="p-4 font-bold">Active To</th>
                <th className="p-4 font-bold">Limit Number</th>
                <th className="p-4 font-bold">Used From</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50/80 transition-colors">
                  {/* Name */}
                  <td className="p-4 font-bold text-gray-900 text-sm">
                    {coupon.name}
                  </td>

                  {/* Code badge in clean green pill (Matching Image 1) */}
                  <td className="p-4">
                    <span className="font-sans font-bold text-xs px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wider not-italic">
                      {coupon.code}
                    </span>
                  </td>

                  {/* Discount Price */}
                  <td className="p-4 font-bold font-sans text-gray-900 tabular-nums not-italic">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%`
                      : `${settings.currencySymbol} ${coupon.discountValue}`}
                  </td>

                  {/* Active from */}
                  <td className="p-4 text-gray-600 font-sans text-[11px] font-medium not-italic">{coupon.validFrom}</td>

                  {/* Active to */}
                  <td className="p-4 text-gray-600 font-sans text-[11px] font-medium not-italic">{coupon.validTo}</td>

                  {/* Limit number */}
                  <td className="p-4 font-semibold text-gray-700">{coupon.usageLimit}</td>

                  {/* Used from */}
                  <td className="p-4 font-bold text-gray-900">{coupon.usedCount}</td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(coupon)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit Coupon"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold font-sans text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Discount Coupon'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Coupon Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Test Free delivery"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Promo Voucher Code *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DEYKXJXS"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 uppercase font-sans font-bold tracking-wider not-italic focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="fixed">Fixed Flat ({settings.currencySymbol})</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Min. Order ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Usage Limit (Count)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Active From
                  </label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Active To
                  </label>
                  <input
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <span className="text-xs font-bold text-gray-800">Coupon Active and Redeemable</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
