import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Utensils,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Reservation } from '../../types';

export const ReservationsPage: React.FC = () => {
  const { settings, createReservation, showToast } = useRestaurant();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('07:30 PM');
  const [guests, setGuests] = useState(4);
  const [seatingPreference, setSeatingPreference] = useState<Reservation['seatingPreference']>('Window Booth');
  const [specialRequests, setSpecialRequests] = useState('');
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  const availableTimeSlots = [
    '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM',
    '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM'
  ];

  const minDate = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !date || !timeSlot) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    const newRes = createReservation({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || 'guest@example.com',
      customerPhone: customerPhone.trim(),
      date,
      timeSlot,
      guests,
      seatingPreference,
      specialRequests: specialRequests.trim(),
    });

    setConfirmedReservation(newRes);
  };

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <CalendarDays className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Table Reservations</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Reserve Your Dining Table
        </h1>
        <p className="text-xs sm:text-sm text-[#686B70] mt-2">
          Enjoy intimate candlelit booths, spacious family dining halls, or breezy outdoor patio seating at {settings.restaurantName}.
        </p>
      </div>

      {/* Demo Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 max-w-3xl mx-auto">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Demo Notice: </span>
          <span>
            Table booking is simulated in demo mode. Your reservation will immediately generate a reference ID and be visible in the Admin Dashboard!
          </span>
        </div>
      </div>

      {confirmedReservation ? (
        /* Booking Confirmation Card */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#E9E9E5] shadow-xl text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF8E7] text-[#07131A] uppercase tracking-wider border border-[#F5B51B]/30">
              Reference #{confirmedReservation.referenceNumber}
            </span>
            <h2 className="font-serif text-3xl font-bold text-gray-900 mt-2">
              Table Reservation Confirmed!
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              We look forward to hosting you at {settings.restaurantName}.
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Guest Name</span>
              <span className="block text-xs font-bold text-gray-900 mt-0.5 truncate">{confirmedReservation.customerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Date & Time</span>
              <span className="block text-xs font-bold text-gray-900 mt-0.5">{confirmedReservation.date} • {confirmedReservation.timeSlot}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Party Size</span>
              <span className="block text-xs font-bold text-gray-900 mt-0.5">{confirmedReservation.guests} Guests</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Seating</span>
              <span className="block text-xs font-bold text-gray-900 mt-0.5">{confirmedReservation.seatingPreference}</span>
            </div>
          </div>

          {confirmedReservation.specialRequests && (
            <div className="text-left bg-[#FFF8E7] p-4 rounded-xl border border-[#F5B51B]/30 text-xs">
              <span className="font-bold text-[#07131A]">Special Request: </span>
              <span className="text-gray-700">{confirmedReservation.specialRequests}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setConfirmedReservation(null)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#07131A] text-white text-xs font-bold hover:bg-black"
            >
              Make Another Booking
            </button>
            <a
              href={`tel:${settings.phone}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817] flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Us for Changes</span>
            </a>
          </div>
        </div>
      ) : (
        /* Reservation Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-3xl border border-[#E9E9E5] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Party and Date */}
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F5B51B] text-[#07131A] text-xs font-extrabold flex items-center justify-center">1</span>
                  Select Date, Time & Guests
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Dining Date *
                    </label>
                    <input
                      type="date"
                      min={minDate}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] bg-white"
                    />
                  </div>

                  {/* Time slot */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Time Slot *
                    </label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] bg-white"
                    >
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Guest count */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Party Size *
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Seating Preference */}
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F5B51B] text-[#07131A] text-xs font-extrabold flex items-center justify-center">2</span>
                  Seating Environment
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Window Booth', desc: 'Cozy street view' },
                    { label: 'Indoor Dining', desc: 'Central hall air-conditioned' },
                    { label: 'Outdoor Patio', desc: 'Fresh air & garden lights' },
                    { label: 'Private Room', desc: 'Private family salon' },
                  ].map((seat) => (
                    <button
                      key={seat.label}
                      type="button"
                      onClick={() => setSeatingPreference(seat.label as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        seatingPreference === seat.label
                          ? 'border-[#F5B51B] bg-[#FFF8E7] text-[#07131A] ring-1 ring-[#F5B51B]'
                          : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="block font-bold text-xs">{seat.label}</span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">{seat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Contact Information */}
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#F5B51B] text-[#07131A] text-xs font-extrabold flex items-center justify-center">3</span>
                  Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tanvir Rahman"
                      required
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+880 1711 000000"
                      required
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tanvir@example.com"
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                    Special Requests or Dietary Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Birthday anniversary candle, baby high chair, wheelchair ramp..."
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-sm uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/25 flex items-center justify-center gap-2"
              >
                <CalendarDays className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Instant Table Reservation</span>
              </button>
            </form>
          </div>

          {/* Right Column: Policies & Atmosphere */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E9E9E5] shadow-sm space-y-4">
              <h4 className="font-serif text-lg font-bold text-[#17191C]">
                Reservation Policy
              </h4>
              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5B51B] mt-1.5 shrink-0" />
                  <span>Tables are held for up to 15 minutes past the reserved time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5B51B] mt-1.5 shrink-0" />
                  <span>No cancellation fees. Please notify us if your plan changes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5B51B] mt-1.5 shrink-0" />
                  <span>For banquet reservations (&gt;16 guests), call our manager directly.</span>
                </li>
              </ul>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-500">Need immediate booking?</span>
                <a
                  href={`tel:${settings.phone}`}
                  className="block text-sm font-bold text-[#07131A] hover:text-[#E9A817] mt-0.5"
                >
                  {settings.phone}
                </a>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden border border-[#E9E9E5] relative aspect-[4/3] bg-gray-900 group">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80"
                alt="Dining Room"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5 text-white">
                <span className="font-serif text-sm font-bold">
                  “Elegant ambiance, royal hospitality.”
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
