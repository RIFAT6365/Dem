import React from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  Heart,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const Footer: React.FC = () => {
  const { settings } = useRestaurant();

  return (
    <footer className="bg-[#07131A] text-gray-300 pt-16 pb-12 border-t border-[#1c2c37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#1c2c37]">
          {/* Column 1: Restaurant Info & Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group inline-flex">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5B51B] to-[#E9A817] flex items-center justify-center text-[#07131A] shadow-md shadow-[#F5B51B]/20">
                <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-[#F5B51B] transition-colors leading-none">
                  {settings.restaurantName}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#F5B51B] font-semibold mt-1">
                  Restaurant & Dine
                </div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Good food, great mood. We serve fresh, delicious food crafted with love, heritage recipes, and genuine care.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.facebookUrl || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-[#0E1E28] border border-gray-700/60 flex items-center justify-center text-gray-300 hover:text-[#F5B51B] hover:border-[#F5B51B] transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={settings.instagramUrl || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-[#0E1E28] border border-gray-700/60 flex items-center justify-center text-gray-300 hover:text-[#F5B51B] hover:border-[#F5B51B] transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={settings.twitterUrl || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-[#0E1E28] border border-gray-700/60 flex items-center justify-center text-gray-300 hover:text-[#F5B51B] hover:border-[#F5B51B] transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5B51B]"></span>
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-[#F5B51B] transition-colors flex items-center gap-2">
                  <span className="text-[#F5B51B]">›</span> Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#F5B51B] transition-colors flex items-center gap-2">
                  <span className="text-[#F5B51B]">›</span> Menu & Specialties
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F5B51B] transition-colors flex items-center gap-2">
                  <span className="text-[#F5B51B]">›</span> About Us
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#F5B51B] transition-colors flex items-center gap-2">
                  <span className="text-[#F5B51B]">›</span> Food Gallery
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-[#F5B51B] transition-colors flex items-center gap-2">
                  <span className="text-[#F5B51B]">›</span> Customer Reviews
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="hover:text-[#F5B51B] transition-colors flex items-center gap-2">
                  <span className="text-[#F5B51B]">›</span> Table Reservations
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-[#F5B51B] transition-colors flex items-center gap-2">
                  <span className="text-[#F5B51B]">›</span> Special Offers & Coupons
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-[#F5B51B] transition-colors flex items-center gap-2">
                  <span className="text-[#F5B51B]">›</span> Track Live Order
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#F5B51B] transition-colors flex items-center gap-2">
                  <span className="text-[#F5B51B]">›</span> FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5B51B]"></span>
              Contact Us
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#F5B51B] shrink-0 mt-0.5" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#F5B51B] shrink-0 mt-0.5" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#F5B51B] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{settings.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#F5B51B] shrink-0 mt-0.5" />
                <span>{settings.openingHours}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Find Us on Google Maps */}
          <div>
            <h3 className="text-white text-base font-semibold mb-4 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5B51B]"></span>
              Find Us on Google Maps
            </h3>
            <div className="rounded-xl overflow-hidden border border-gray-700/80 bg-[#0E1E28] p-2 group hover:border-[#F5B51B]/60 transition-all">
              <div className="relative h-32 rounded-lg overflow-hidden bg-gray-800">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
                  alt="Restaurant Location Map"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-[#07131A]/40 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="pt-2.5 px-1">
                <p className="text-xs text-gray-300 font-medium truncate">{settings.address}</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#F5B51B] hover:text-[#E9A817] font-semibold mt-1"
                >
                  View on Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div>
            © {new Date().getFullYear()} {settings.restaurantName}. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span>Good Food</span>
            <Heart className="w-3.5 h-3.5 text-[#F5B51B] fill-[#F5B51B]" />
            <span>Great Mood</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link to="/admin" className="text-[#F5B51B] hover:underline flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
