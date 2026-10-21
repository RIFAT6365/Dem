/**
 * Customer Saved Addresses Page
 * Supports full CRUD for customer delivery locations in public.addresses
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addressService, CustomerAddress } from '../../services/addressService';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase, AlertCircle, X } from 'lucide-react';

export const AccountAddressesPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form fields
  const [label, setLabel] = useState('Home');
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [city, setCity] = useState('Dhaka');
  const [area, setArea] = useState('Dhanmondi');
  const [address, setAddress] = useState('');
  const [flatOrHouse, setFlatOrHouse] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryAreas = [
    'Dhanmondi',
    'Gulshan-1',
    'Gulshan-2',
    'Banani',
    'Uttara',
    'Mirpur',
    'Mohammadpur',
    'Baily Road / Shantinagar',
    'Bashundhara R/A',
    'Badda / Rampura',
    'Motijheel / Dilkusha',
  ];

  const loadAddresses = async () => {
    if (user?.id) {
      const data = await addressService.getUserAddresses(user.id);
      setAddresses(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setErrorMsg('');

    if (!address.trim() || !area.trim() || !phone.trim()) {
      setErrorMsg('Please provide your street address, area, and contact phone.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addressService.addAddress({
        userId: user.id,
        label,
        fullName: fullName || 'Customer',
        phone,
        city,
        area,
        address,
        flatOrHouse,
        landmark,
        isDefault,
      });

      setShowAddModal(false);
      setAddress('');
      setFlatOrHouse('');
      setLandmark('');
      await loadAddresses();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this delivery address?')) {
      await addressService.deleteAddress(id);
      await loadAddresses();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#E9A817]" />
            <span>Saved Delivery Addresses</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Save your home, office, and frequent delivery spots for one-click checkout
          </p>
        </div>
        <button
          onClick={() => {
            setFullName(profile?.fullName || '');
            setPhone(profile?.phone || '');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-gray-400">Loading saved locations...</div>
      ) : addresses.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-500">No delivery addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all relative ${
                item.isDefault
                  ? 'border-[#F5B51B] bg-[#FFF8E7]/40 ring-1 ring-[#F5B51B]'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                  {item.label === 'Work' ? <Briefcase className="w-3.5 h-3.5 text-blue-600" /> : <Home className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{item.label}</span>
                </span>
                {item.isDefault && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5B51B] text-[#07131A]">
                    Default
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-800 font-semibold">{item.fullName} • {item.phone}</div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {item.flatOrHouse && `${item.flatOrHouse}, `}
                {item.address}, {item.area}, {item.city}
              </p>
              {item.landmark && (
                <div className="text-[11px] text-gray-400 mt-1">Landmark: {item.landmark}</div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#07131A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-gray-900">Add Delivery Address</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Address Label</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Office / Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Area / Neighborhood</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                >
                  {deliveryAreas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 42, Road 7/A"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Flat / House</label>
                  <input
                    type="text"
                    value={flatOrHouse}
                    onChange={(e) => setFlatOrHouse(e.target.value)}
                    placeholder="e.g. Flat 4B"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Lake"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#F5B51B]"
                />
                <label htmlFor="defaultCheck" className="text-xs text-gray-700">
                  Set as default delivery address
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817]"
                >
                  {isSubmitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
