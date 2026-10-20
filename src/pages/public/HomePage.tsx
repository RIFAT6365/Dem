import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Phone,
  ArrowRight,
  Leaf,
  ChefHat,
  Users,
  Star,
  Sparkles,
  CalendarDays,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Quote,
  Flame,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ProductCard } from '../../components/common/ProductCard';
import { QuickAddModal } from '../../components/common/QuickAddModal';
import { Product } from '../../types';

export const HomePage: React.FC = () => {
  const { settings, products, reviews, gallery, coupons, showToast } = useRestaurant();
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Filter popular / featured items (5 items matching screenshot)
  const popularDishes = products.filter((p) => p.isFeatured || p.isBestseller).slice(0, 5);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed! Thank you for joining our VIP food club.');
  };

  const nextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevGallery = () => {
    setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* 1. HERO SECTION (Matching Royal Spice Screenshot) */}
      <section className="relative bg-[#07131A] text-white pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden border-b border-[#1c2c37]">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F5B51B]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#E9A817]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#152733] border border-[#223544] text-xs font-bold uppercase tracking-[0.2em] text-[#F5B51B]">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B51B]" />
                <span>WELCOME TO {settings.restaurantName.toUpperCase()}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                Good Food <br />
                <span className="text-[#F5B51B]">Brings People</span> Together
              </h1>

              <p className="text-base sm:text-lg text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Experience the authentic taste of traditional recipes, prepared with fresh ingredients and full of flavor.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/menu"
                  className="px-7 py-3.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#F5B51B]/20 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <UtensilsCrossed className="w-4 h-4 stroke-[2.5]" />
                  <span>View Our Menu</span>
                </Link>

                <a
                  href={`tel:${settings.phone}`}
                  className="px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white font-semibold text-sm border border-gray-600 hover:border-gray-400 transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#F5B51B]" />
                  <span>Call Now</span>
                </a>
              </div>

              {/* Quick stats / highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#1c2c37] max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="font-serif text-2xl font-bold text-[#F5B51B]">15+</div>
                  <div className="text-xs text-gray-400">Authentic Dishes</div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-white">4.9 ★</div>
                  <div className="text-xs text-gray-400">Customer Rating</div>
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-[#F5B51B]">30 min</div>
                  <div className="text-xs text-gray-400">Average Delivery</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image (Biryani Plate) */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px]">
                {/* Golden background ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#F5B51B]/40 animate-[spin_40s_linear_infinite]" />
                <div className="absolute -inset-3 rounded-full bg-radial from-[#F5B51B]/20 via-transparent to-transparent blur-md" />

                {/* Big Platter Image */}
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-[#07131A] shadow-black/80">
                  <img
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80"
                    alt="Signature Royal Biryani"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Floating promo badge */}
                <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-0 bg-white/95 backdrop-blur-md text-[#07131A] p-3.5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5B51B] flex items-center justify-center font-black text-sm">
                    100%
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold uppercase tracking-wider text-gray-900 leading-tight">
                      Halal & Fresh
                    </span>
                    <span className="block text-[11px] text-gray-500">Pure Ghee & Dum Spices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR FEATURE HIGHLIGHTS (Fresh Ingredients, Expert Chefs, Family Friendly, Great Taste) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E9E5] shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center shrink-0 border border-[#F5B51B]/30">
              <Leaf className="w-6 h-6 text-[#E9A817]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#17191C]">Fresh Ingredients</h3>
              <p className="text-xs text-[#686B70] mt-1 leading-relaxed">
                We use only the freshest and best ingredients.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E9E5] shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center shrink-0 border border-[#F5B51B]/30">
              <ChefHat className="w-6 h-6 text-[#E9A817]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#17191C]">Expert Chefs</h3>
              <p className="text-xs text-[#686B70] mt-1 leading-relaxed">
                Our chefs bring authentic taste to your plate.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E9E5] shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center shrink-0 border border-[#F5B51B]/30">
              <Users className="w-6 h-6 text-[#E9A817]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#17191C]">Family Friendly</h3>
              <p className="text-xs text-[#686B70] mt-1 leading-relaxed">
                A perfect place for family & friends.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9E9E5] shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center shrink-0 border border-[#F5B51B]/30">
              <Star className="w-6 h-6 text-[#E9A817]" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#17191C]">Great Taste</h3>
              <p className="text-xs text-[#686B70] mt-1 leading-relaxed">
                Delicious food, Happy customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR MENU SECTION (Matching Royal Spice Screenshot) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#E9A817] mb-1">
              — OUR SPECIALTIES
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
              Popular Menu
            </h2>
            <p className="text-xs sm:text-sm text-[#686B70] mt-1">
              Explore our most loved dishes, made with fresh ingredients and authentic flavors.
            </p>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#07131A] hover:text-[#E9A817] transition-colors group"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#F5B51B]" />
          </Link>
        </div>

        {/* 5-Column Grid matching Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {popularDishes.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenQuickAdd={(p) => setQuickAddProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* 4. ABOUT US SECTION (Matching Royal Spice Screenshot) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E9E9E5] overflow-hidden p-6 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Image: Interior with Good Food Good Vibes */}
            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative bg-gray-900 group">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
                  alt="Restaurant Dining Atmosphere"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Neon "Good Food Good Vibes" Badge Overlay */}
                <div className="absolute top-6 left-6 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white font-serif italic text-lg sm:text-xl shadow-2xl">
                  “Good Food <br />
                  Good Vibes ♡”
                </div>
              </div>
            </div>

            {/* Right Story Copy */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#E9A817] mb-1">
                  — ABOUT US
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
                  Our Story, Our Passion
                </h2>
              </div>

              <p className="text-sm text-[#686B70] leading-relaxed">
                At {settings.restaurantName}, we believe that great food brings people together. We serve a variety of delicious dishes made from fresh ingredients, with authentic flavors. Our goal is to give you a memorable dining experience in a clean, friendly and comfortable environment.
              </p>

              {/* 3 Value badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF8] border border-[#E9E9E5]">
                  <Leaf className="w-4 h-4 text-[#E9A817] shrink-0" />
                  <span className="text-xs font-bold text-[#17191C]">Fresh Ingredients</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF8] border border-[#E9E9E5]">
                  <ChefHat className="w-4 h-4 text-[#E9A817] shrink-0" />
                  <span className="text-xs font-bold text-[#17191C]">Skilled Chefs</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF8] border border-[#E9E9E5]">
                  <Users className="w-4 h-4 text-[#E9A817] shrink-0" />
                  <span className="text-xs font-bold text-[#17191C]">Friendly Staff</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOD GALLERY CAROUSEL (Matching Royal Spice Screenshot) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E9A817] mb-1">
            — FOOD GALLERY
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
            A Glimpse of Our Delicious Food
          </h2>
          <p className="text-xs sm:text-sm text-[#686B70] mt-1">
            Take a look at some of our special dishes and restaurant ambiance.
          </p>
        </div>

        {/* Carousel / Grid */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {gallery.slice(0, 5).map((item, idx) => (
              <Link
                key={item.id}
                to="/gallery"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-[#E9E9E5] shadow-xs"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                  <span className="text-xs font-bold leading-tight line-clamp-1">{item.title}</span>
                  <span className="text-[10px] text-[#F5B51B]">{item.category}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#07131A] hover:text-[#E9A817]"
            >
              <span>Explore Complete Photo Gallery</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F5B51B]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS (Matching Royal Spice Screenshot) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E9A817] mb-1">
            — CUSTOMER REVIEWS
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-[#686B70] mt-1">
            We are grateful for the love and support from our valued customers.
          </p>
        </div>

        {/* 3 Review Cards matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-2xl border border-[#E9E9E5] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={rev.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={rev.authorName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#F5B51B]/40"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#17191C] leading-tight">{rev.authorName}</h4>
                    {/* 5 Stars */}
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'fill-[#F5B51B] text-[#F5B51B]'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#686B70] leading-relaxed italic">
                  “{rev.comment}”
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E9E9E5] flex items-center justify-between text-[11px] text-gray-500">
                <span>{rev.date}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Guest
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/reviews"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#07131A] hover:text-[#E9A817]"
          >
            <span>Read All Verified Reviews ({reviews.length}) & Leave Feedback</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F5B51B]" />
          </Link>
        </div>
      </section>

      {/* 7. SPECIAL OFFERS / COUPON CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#07131A] via-[#0E1E28] to-[#152733] rounded-3xl p-8 sm:p-12 text-white border border-[#223544] relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#F5B51B]/15 to-transparent pointer-events-none" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F5B51B] text-[#07131A] inline-block">
                Hot Deal Today
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Get Up to 15% Off Your Feast with Promo Code
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                Order your favorites online and use code <strong className="text-[#F5B51B]">ROYALSPICE</strong> at checkout for special dining savings!
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <Link
                to="/order"
                className="px-6 py-3.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-center text-xs uppercase tracking-wider transition-all shadow-lg"
              >
                Order Online Now
              </Link>
              <Link
                to="/offers"
                className="px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white border border-gray-600 text-center text-xs font-semibold"
              >
                View All Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. RESERVATION CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E9E9E5] p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center mx-auto mb-4 border border-[#F5B51B]/30">
            <CalendarDays className="w-7 h-7 text-[#E9A817]" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#17191C]">
            Planning a Special Gathering or Family Dinner?
          </h3>
          <p className="text-xs sm:text-sm text-[#686B70] mt-2 mb-6 max-w-lg mx-auto">
            Reserve your table in advance to enjoy personalized seating, custom celebration arrangements, and priority chef preparation.
          </p>
          <Link
            to="/reservations"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-sm transition-all shadow-md shadow-[#F5B51B]/20"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Book a Table Online</span>
          </Link>
        </div>
      </section>

      {/* 9. NEWSLETTER FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#07131A] rounded-3xl p-8 sm:p-10 border border-[#1c2c37] text-center text-white">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold">
            Join Our VIP Gourmet Club
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            Get exclusive secret discount codes, weekend chef specials, and festival menu previews delivered straight to your inbox.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-grow px-4 py-3 rounded-xl bg-[#0E1E28] border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#F5B51B]"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <span>Subscribe</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-emerald-400 mt-2 font-medium">✓ You are subscribed!</p>
          )}
        </div>
      </section>

      {/* Quick Add Customization Modal */}
      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
        />
      )}
    </div>
  );
};
