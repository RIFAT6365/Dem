import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  Leaf,
  Users,
  Award,
  Clock,
  Heart,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const AboutPage: React.FC = () => {
  const { settings } = useRestaurant();

  const chefs = [
    {
      name: 'Chef Tariqul Islam',
      role: 'Executive Master Chef',
      specialty: 'Dum Biryani & Royal Mughal Recipes',
      experience: '22 Years of Culinary Mastery',
      image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Chef Sarah Chowdhury',
      role: 'Head Pastry & Tandoor Specialist',
      specialty: 'Artisanal Breads, Kulfi & Traditional Sweets',
      experience: '14 Years in Fine Dining',
      image: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Chef Zubair Al-Hasan',
      role: 'Grill & Charcoal Pitmaster',
      specialty: 'Authentic Smoky Kebabs & Clay Oven Delicacies',
      experience: '18 Years of Charcoal Grilling',
      image: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Header */}
      <section className="relative bg-[#07131A] text-white py-20 border-b border-[#1c2c37] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#152733] border border-[#223544] text-xs font-bold uppercase tracking-widest text-[#F5B51B] mb-3">
            <Heart className="w-3.5 h-3.5 text-[#F5B51B]" />
            <span>Our Heritage & Culinary Soul</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            About {settings.restaurantName}
          </h1>
          <p className="text-base text-gray-300 max-w-2xl mx-auto mt-4 leading-relaxed">
            Where centuries-old culinary traditions meet the freshest modern ingredients to create unforgettably rich dining moments.
          </p>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#E9A817]">
              — HOW IT ALL STARTED
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
              Preserving Authentic Taste Across Generations
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Founded with an unyielding passion for hospitality, {settings.restaurantName} was born from a simple belief: good food brings family, friends, and community together. We set out to create an inviting haven where people could experience rich, heritage dishes slow-cooked in the authentic, time-honored way.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              From our hand-ground whole spices and pure cultured ghee to our glowing clay tandoor oven, every single dish is prepared without artificial flavors or shortcuts. We take pride in delivering comfort, warmth, and culinary excellence in every bite.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <span className="font-serif text-3xl font-bold text-[#F5B51B]">100%</span>
                <span className="block text-xs font-bold text-gray-800 mt-1">Halal Certified</span>
                <span className="text-[11px] text-gray-500">Every cut sourced ethically</span>
              </div>
              <div>
                <span className="font-serif text-3xl font-bold text-[#F5B51B]">Zero</span>
                <span className="block text-xs font-bold text-gray-800 mt-1">Artificial Preservatives</span>
                <span className="text-[11px] text-gray-500">Fresh daily preparation</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-gray-900">
              <img
                src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80"
                alt="Restaurant Dining Atmosphere"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-8 text-white">
                <div>
                  <span className="text-xs text-[#F5B51B] font-bold uppercase tracking-wider">
                    Our Promise
                  </span>
                  <p className="font-serif text-xl sm:text-2xl font-bold mt-1">
                    “A warm smile, pure ingredients, and timeless flavors at every table.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Culinary Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E9A817] mb-1">
            — THE MASTERS BEHIND THE FLAVOR
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
            Meet Our Master Chefs
          </h2>
          <p className="text-xs sm:text-sm text-[#686B70] mt-1">
            Dedicated culinary artists who craft every marinade, gravy, and bread with devotion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {chefs.map((chef, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl overflow-hidden border border-[#E9E9E5] shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                <img
                  src={chef.image}
                  alt={chef.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E9A817]">
                  {chef.role}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#17191C]">{chef.name}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{chef.specialty}</p>
                <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <Award className="w-3.5 h-3.5 text-[#F5B51B]" />
                  <span>{chef.experience}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#07131A] text-white p-10 sm:p-14 rounded-3xl border border-[#1c2c37] text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            Experience the Royal Hospitality Today
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Whether you are booking a family celebration or ordering dinner for home, we are honored to serve you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/reservations"
              className="px-8 py-3.5 rounded-xl bg-[#F5B51B] text-[#07131A] font-bold text-xs uppercase tracking-wider hover:bg-[#E9A817] transition-all shadow-lg"
            >
              Book a Table
            </Link>
            <Link
              to="/menu"
              className="px-8 py-3.5 rounded-xl bg-transparent border border-gray-600 hover:border-gray-300 text-white font-semibold text-xs"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
