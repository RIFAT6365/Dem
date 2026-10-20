import React, { useState } from 'react';
import {
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Users,
  Clock,
  MapPin,
  Trash2,
  X,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Reservation, ReservationStatus } from '../../types';

export const AdminReservationsPage: React.FC = () => {
  const { reservations, updateReservationStatus, deleteReservation, createReservation } = useRestaurant();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Walk-in form state
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('08:00 PM');
  const [partySize, setPartySize] = useState(4);
  const [seating, setSeating] = useState<Reservation['seatingPreference']>('Indoor Dining');
  const [tableAssigned, setTableAssigned] = useState('Table C-05');

  const filtered = reservations.filter((r) => {
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchRef = r.referenceNumber.toLowerCase().includes(q);
      const matchPhone = r.customerPhone.includes(q);
      if (!matchName && !matchRef && !matchPhone) return false;
    }
    return true;
  });

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim()) return;

    createReservation({
      customerName: guestName.trim(),
      customerEmail: 'walkin@example.com',
      customerPhone: phone.trim(),
      date,
      timeSlot,
      guests: partySize,
      seatingPreference: seating,
      tableAssigned,
      specialRequests: 'Walk-in / Phone reservation entered by staff.',
    });

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900">
            Table Reservations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor upcoming dining bookings, assign tables, and seat guests.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Walk-in Reservation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {['All', 'Pending', 'Confirmed', 'Seated', 'Completed', 'Canceled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-[#07131A] text-[#F5B51B]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest, phone, ref #..."
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F5B51B]"
          />
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-bold">Reference #</th>
                <th className="p-4 font-bold">Guest Details</th>
                <th className="p-4 font-bold">Date & Time</th>
                <th className="p-4 font-bold">Party Size</th>
                <th className="p-4 font-bold">Seating / Table</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-sans font-bold text-gray-900 not-italic">#{res.referenceNumber}</td>
                  <td className="p-4">
                    <span className="font-bold text-gray-900 block leading-tight text-sm">
                      {res.customerName}
                    </span>
                    <span className="text-[11px] text-gray-500">{res.customerPhone}</span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{res.date}</div>
                    <div className="text-[11px] text-gray-500">{res.timeSlot}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-bold text-gray-800">
                      {res.guests} Guests
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{res.seatingPreference}</div>
                    <div className="text-[11px] text-[#E9A817] font-bold">
                      {res.tableAssigned ? `Assigned: ${res.tableAssigned}` : 'No table allocated'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      res.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : res.status === 'Seated'
                        ? 'bg-blue-100 text-blue-800'
                        : res.status === 'Completed'
                        ? 'bg-gray-100 text-gray-800'
                        : res.status === 'Canceled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {res.status === 'Pending' && (
                        <button
                          onClick={() => updateReservationStatus(res.id, 'Confirmed', 'Table W-02')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                        >
                          Confirm
                        </button>
                      )}
                      {res.status === 'Confirmed' && (
                        <button
                          onClick={() => updateReservationStatus(res.id, 'Seated')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700"
                        >
                          Seat Guest
                        </button>
                      )}
                      {res.status === 'Seated' && (
                        <button
                          onClick={() => updateReservationStatus(res.id, 'Completed')}
                          className="px-2.5 py-1 rounded-lg bg-gray-800 text-white font-bold text-[11px] hover:bg-black"
                        >
                          Done
                        </button>
                      )}
                      {res.status !== 'Completed' && res.status !== 'Canceled' && (
                        <button
                          onClick={() => updateReservationStatus(res.id, 'Canceled')}
                          className="px-2 py-1 rounded-lg border border-red-200 text-red-600 text-[11px] hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => deleteReservation(res.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Walk-in Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold font-sans text-gray-900">
                Record Walk-in Booking
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Shakib Al Hasan"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Party Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Assign Table
                  </label>
                  <input
                    type="text"
                    value={tableAssigned}
                    onChange={(e) => setTableAssigned(e.target.value)}
                    placeholder="e.g. Table C-05"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300"
                  />
                </div>
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
                  className="px-6 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817]"
                >
                  Confirm Walk-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
