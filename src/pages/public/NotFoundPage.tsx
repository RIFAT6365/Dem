import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Home, ArrowLeft } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const NotFoundPage: React.FC = () => {
  const { settings } = useRestaurant();

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="bg-white rounded-3xl border border-[#E9E9E5] p-10 sm:p-14 text-center max-w-lg shadow-sm space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#FFF8E7] text-[#E9A817] flex items-center justify-center mx-auto border border-[#F5B51B]/30">
          <UtensilsCrossed className="w-10 h-10" />
        </div>

        <div>
          <span className="font-serif text-7xl font-extrabold text-[#07131A] block leading-none">
            404
          </span>
          <h1 className="font-serif text-2xl font-bold text-gray-900 mt-2">
            Dish or Page Not Found
          </h1>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
            The page you are looking for might have been removed, renamed, or is temporarily out of service.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-[#07131A] text-white text-xs font-bold hover:bg-black transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            to="/menu"
            className="px-6 py-3 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817] transition-colors"
          >
            Explore Menu
          </Link>
        </div>
      </div>
    </div>
  );
};
