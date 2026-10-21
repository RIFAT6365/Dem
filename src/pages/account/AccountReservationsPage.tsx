/**
 * Customer Table Bookings Page
 * Displays customer's dining reservations, guest count, seating preference, and assigned table
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reservationService } from '../../services/reservationService';
import { Reservation } from '../../types';
import { CalendarDays, Clock, Users, MapPin, Plus, CheckCircle2 } from 'lucide-react';

export const AccountReservationsPage: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      reservationService.fetchCustomerReservations(user.id).then((data) => {
        setReservations(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#E9A817]" />
            <span>Dining Table Bookings</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track confirmed tables and dining reservations at DEM Restaurant
          </p>
        </div>
        <Link
          to="/reservations"
          className="px-4 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book a Table</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading your reservations...</div>
      ) : reservations.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <CalendarDays className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-500">No table reservations found.</p>
          <Link
            to="/reservations"
            className="inline-block px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817]"
          >
            Reserve Table Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-gray-900 text-sm">#{res.referenceNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      res.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : res.status === 'Canceled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-[#FFF8E7] text-[#07131A] border border-[#F5B51B]/40'
                    }`}>
                      {res.status}
                    </span>
                    {res.tableAssigned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        Table {res.tableAssigned}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-gray-800">
                      <CalendarDays className="w-3.5 h-3.5 text-[#E9A817]" />
                      <span>{res.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{res.timeSlot}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{res.guests} Guests</span>
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 sm:text-right">
                  <div className="font-medium text-gray-700">{res.seatingPreference}</div>
                  {res.specialRequests && (
                    <div className="text-[11px] text-gray-400 italic mt-0.5">
                      &quot;{res.specialRequests}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
