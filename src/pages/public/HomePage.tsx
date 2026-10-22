import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Heart,
  Briefcase,
  PartyPopper,
  Wine,
  Clock,
  Compass,
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

  // Reviews Carousel State
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Published reviews (fallback to sample if empty)
  const publishedReviews = reviews.filter((r) => r.isApproved);
  const activeReviews = publishedReviews.length > 0 ? publishedReviews : reviews;

  // Autoplay carousel every 5 seconds unless paused or reduced-motion requested
  useEffect(() => {
    if (activeReviews.length <= 1 || isCarouselPaused) return;

    // Respect reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const timer = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % activeReviews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeReviews.length, isCarouselPaused]);

  // Touch swipe support for mobile review carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next
        setCurrentReviewIndex((prev) => (prev + 1) % activeReviews.length);
      } else {
        // swipe right -> prev
        setCurrentReviewIndex((prev) => (prev - 1 + activeReviews.length) % activeReviews.length);
      }
    }
    touchStartXRef.current = null;
  };

  // Filter popular / featured items (5 items)
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

  // Continental Favourites Categories Data
  const continentalCategories = [
    {
      id: 'cont-pasta',
      name: 'Artisan Pasta',
      slug: 'curries-and-gravies', // Maps to existing menu category or filter
      desc: 'Creamy Fettuccine Alfredo, Penne Arrabbiata & slow-simmered Ravioli',
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=800&q=80',
      badge: 'Chef Signature',
    },
    {
      id: 'cont-pizza',
      name: 'Wood-Fired Pizza',
      slug: 'burgers-and-fast-food',
      desc: 'Hand-stretched Neapolitan crusts, San Marzano tomatoes & fresh Mozzarella',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      badge: 'Crisp & Hot',
    },
    {
      id: 'cont-steaks',
      name: 'Prime Steaks & Grills',
      slug: 'grills-and-kebabs',
      desc: 'Dry-aged Ribeye, Herb-butter Tenderloin & sizzling volcanic platters',
      image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80',
      badge: 'Charcoal Searing',
    },
    {
      id: 'cont-burgers',
      name: 'Gourmet Burgers',
      slug: 'burgers-and-fast-food',
      desc: 'Wagyu smash patties, glazed brioche, truffle aioli & crispy wedges',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      badge: 'Juicy Favorite',
    },
    {
      id: 'cont-salads',
      name: 'Continental Salads',
      slug: 'appetizers-and-breads',
      desc: 'Crisp Caesar, Mediterranean feta, arugula & aged balsamic glaze',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      badge: 'Farm Fresh',
    },
    {
      id: 'cont-desserts',
      name: 'Exquisite Desserts',
      slug: 'desserts-and-sweets',
      desc: 'Velvety Tiramisu, Belgian Molten Lava Cake & artisanal gelato scoops',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      badge: 'Sweet Finale',
    },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
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
                  <div className="font-sans font-bold text-2xl text-[#F5B51B] tabular-nums">25+</div>
                  <div className="text-xs text-gray-400">Authentic Dishes</div>
                </div>
                <div>
                  <div className="font-sans font-bold text-2xl text-white tabular-nums">4.9 ★</div>
                  <div className="text-xs text-gray-400">Customer Rating</div>
                </div>
                <div>
                  <div className="font-sans font-bold text-2xl text-[#F5B51B] tabular-nums">30 min</div>
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

                {/* Hero Round Plate Food */}
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#F5B51B] shadow-2xl relative z-10 bg-gray-900">
                  <img
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80"
                    alt="Royal Special Biryani"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Floating Special Price Badge */}
                <div className="absolute -bottom-2 -left-2 sm:bottom-4 sm:left-2 bg-[#0E1E28] border border-[#F5B51B]/60 p-3 sm:p-4 rounded-2xl shadow-2xl z-20 flex items-center gap-3 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-[#F5B51B] flex items-center justify-center text-[#07131A] font-bold">
                    <Flame className="w-5 h-5 fill-[#07131A]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B51B] block">
                      CHEF'S SPECIAL DUM
                    </span>
                    <span className="font-bold text-sm text-white block">
                      {settings.currencySymbol} 180 <span className="text-gray-400 text-xs font-normal">/ Plate</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR MENU SECTION */}
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

        {/* 5-Column Grid */}
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

      {/* 3. ABOUT US SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E9E9E5] overflow-hidden p-6 lg:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Image */}
            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative bg-gray-900 group">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"
                  alt="Restaurant Dining Atmosphere"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
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

      {/* 4. FOOD GALLERY HIGHLIGHTS */}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {gallery.slice(0, 5).map((item) => (
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
      </section>

      {/* ========================================================================= */}
      {/* 5. NEW SECTION A: CONTINENTAL FAVOURITES (Directly ABOVE Reviews)          */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#E9A817] mb-1 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-[#F5B51B]" />
              <span>EXPLORE OUR MENU</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
              Continental Favourites
            </h2>
            <p className="text-xs sm:text-sm text-[#686B70] mt-1 max-w-xl">
              From hand-crafted Italian pasta to charcoal-seared prime steaks, immerse in refined European culinary traditions.
            </p>
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#07131A] hover:text-[#E9A817] transition-colors group self-start sm:self-auto"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#F5B51B]" />
          </Link>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {continentalCategories.map((item) => (
            <Link
              key={item.id}
              to={`/menu?category=${item.slug}`}
              className="group bg-white rounded-3xl border border-[#E9E9E5] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Subtle Zoom */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#07131A]/80 text-[#F5B51B] backdrop-blur-md border border-[#F5B51B]/30 shadow-md">
                    {item.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-2">
                  <h3 className="font-serif text-xl font-bold text-[#17191C] group-hover:text-[#E9A817] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#686B70] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="px-5 sm:px-6 pb-5 pt-2 flex items-center justify-between text-xs font-bold text-[#07131A]">
                <span className="group-hover:underline flex items-center gap-1">
                  Browse Selection
                </span>
                <div className="w-7 h-7 rounded-full bg-[#FFF8E7] text-[#07131A] flex items-center justify-center group-hover:bg-[#F5B51B] transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. NEW SECTION B: CRAFTED WITH PASSION & PURPOSE (Directly ABOVE Reviews) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Chef Portrait & Story */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E9E9E5] p-6 sm:p-10 shadow-xs flex flex-col justify-between">
            <div className="space-y-6">
              {/* Chef / Kitchen Photograph */}
              <div className="aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-md bg-gray-900 relative group">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=80"
                  alt="Executive Chef Crafting Gourmet Dishes"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-[#F5B51B]" />
                  <span>Executive Culinary Team</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#E9A817]">
                  MEET OUR CHEF
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C] leading-tight">
                  Crafted with Passion and Purpose
                </h3>
                <p className="text-xs sm:text-sm text-[#686B70] leading-relaxed">
                  Every dish at {settings.restaurantName} is rooted in a profound reverence for heritage gastronomy. From sourcing seasonal organic produce and hand-pounded spices to precision slow-braising, our culinary brigade balances classical continental elegance with unforgettable local flavors.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#07131A] text-white hover:bg-black font-bold text-xs uppercase tracking-wider transition-all shadow-md group"
              >
                <span>Our Story</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F5B51B] group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Perfect for Every Occasion */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF9ED] rounded-3xl border border-[#F5B51B]/30 p-6 sm:p-10 shadow-xs flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#E9A817] mb-1">
                  CELEBRATIONS & DINING
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
                  Perfect for Every Occasion
                </h3>
                <p className="text-xs sm:text-sm text-[#686B70] mt-1">
                  Whether an intimate candlelit celebration or a grand banquet, our team tailors every detail to your momentous gathering.
                </p>
              </div>

              {/* 4 Occasion Items with Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/reservations"
                  className="p-4 rounded-2xl bg-white border border-[#E9E9E5] hover:border-[#F5B51B] transition-all hover:shadow-md group block"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center mb-3 group-hover:bg-[#F5B51B] transition-colors">
                    <Heart className="w-5 h-5 text-[#E9A817] group-hover:text-[#07131A]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#17191C] group-hover:text-[#E9A817] transition-colors">
                    Romantic Dinners
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Candlelit settings, personalized seating, and intimate bespoke courses.
                  </p>
                </Link>

                <Link
                  to="/reservations"
                  className="p-4 rounded-2xl bg-white border border-[#E9E9E5] hover:border-[#F5B51B] transition-all hover:shadow-md group block"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center mb-3 group-hover:bg-[#F5B51B] transition-colors">
                    <Users className="w-5 h-5 text-[#E9A817] group-hover:text-[#07131A]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#17191C] group-hover:text-[#E9A817] transition-colors">
                    Family Gatherings
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Generous family platters, festive round tables, and warm hospitality.
                  </p>
                </Link>

                <Link
                  to="/reservations"
                  className="p-4 rounded-2xl bg-white border border-[#E9E9E5] hover:border-[#F5B51B] transition-all hover:shadow-md group block"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center mb-3 group-hover:bg-[#F5B51B] transition-colors">
                    <Briefcase className="w-5 h-5 text-[#E9A817] group-hover:text-[#07131A]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#17191C] group-hover:text-[#E9A817] transition-colors">
                    Corporate Events
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Executive luncheon menus, private VIP dining rooms, and high-speed Wi-Fi.
                  </p>
                </Link>

                <Link
                  to="/reservations"
                  className="p-4 rounded-2xl bg-white border border-[#E9E9E5] hover:border-[#F5B51B] transition-all hover:shadow-md group block"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center mb-3 group-hover:bg-[#F5B51B] transition-colors">
                    <PartyPopper className="w-5 h-5 text-[#E9A817] group-hover:text-[#07131A]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#17191C] group-hover:text-[#E9A817] transition-colors">
                    Birthdays & Celebrations
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Custom pastry confections, celebration decor, and priority arrangements.
                  </p>
                </Link>
              </div>

              {/* Complimentary Dining Atmosphere Photo */}
              <div className="aspect-[16/7] rounded-2xl overflow-hidden shadow-xs relative">
                <img
                  src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"
                  alt="Atmospheric Dining Lounge"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between">
              <span className="text-xs text-gray-500">Pre-booking recommended on weekends</span>
              <Link
                to="/reservations"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20"
              >
                <span>Reserve an Occasion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CUSTOMER REVIEWS CAROUSEL (Smooth Auto-Sliding with Pause on Hover)   */}
      {/* ========================================================================= */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#E9A817] mb-1">
            — CUSTOMER REVIEWS
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C]">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-[#686B70] mt-1">
            Real dining feedback from verified guests enjoying our culinary hospitality.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Controls: Prev / Next Buttons */}
          <div className="hidden sm:flex items-center justify-between absolute top-1/2 -translate-y-1/2 -left-4 -right-4 z-20 pointer-events-none">
            <button
              onClick={() =>
                setCurrentReviewIndex(
                  (prev) => (prev - 1 + activeReviews.length) % activeReviews.length
                )
              }
              className="p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-50 transition-all pointer-events-auto"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setCurrentReviewIndex((prev) => (prev + 1) % activeReviews.length)
              }
              className="p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-50 transition-all pointer-events-auto"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Cards Grid: 3 cards on desktop with smooth focus */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((offset) => {
              const reviewIdx = (currentReviewIndex + offset) % activeReviews.length;
              const rev = activeReviews[reviewIdx];
              if (!rev) return null;

              return (
                <div
                  key={`${rev.id}-${offset}`}
                  className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E9E9E5] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            rev.authorAvatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                          }
                          alt={rev.authorName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#F5B51B]/40"
                          loading="lazy"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-[#17191C] leading-tight">
                            {rev.authorName}
                          </h4>
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
                      <Quote className="w-6 h-6 text-[#F5B51B]/30" />
                    </div>

                    {rev.title && (
                      <h5 className="font-bold text-xs text-gray-900 leading-snug">
                        {rev.title}
                      </h5>
                    )}

                    <p className="text-xs text-[#686B70] leading-relaxed italic line-clamp-4">
                      “{rev.comment}”
                    </p>

                    {/* Restaurant reply callout if exists */}
                    {rev.adminResponse && (
                      <div className="p-3 rounded-xl bg-[#FFF8E7] border border-[#F5B51B]/30 text-[11px] text-gray-700 space-y-1">
                        <span className="font-bold text-[#07131A] block">
                          Response from {settings.restaurantName}:
                        </span>
                        <p className="italic">{rev.adminResponse}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E9E9E5] flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-sans">{rev.date}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Guest</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Pagination Dots */}
          {activeReviews.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {activeReviews.slice(0, Math.min(activeReviews.length, 6)).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentReviewIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentReviewIndex === idx
                      ? 'w-6 bg-[#F5B51B]'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to review slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/reviews"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#07131A] hover:text-[#E9A817] transition-colors"
          >
            <span>Read All Verified Reviews ({activeReviews.length}) & Leave Feedback</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F5B51B]" />
          </Link>
        </div>
      </section>

      {/* 8. SPECIAL OFFERS / COUPON CALLOUT BANNER */}
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
                Order your favorites online and use code <strong className="text-[#F5B51B]">FREEDELIVERY</strong> or <strong className="text-[#F5B51B]">WELCOME10</strong> at checkout for dining savings!
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

      {/* ========================================================================= */}
      {/* 9. IMPROVED TABLE BOOKING SECTION (With Prominent Dining Interior Photo)   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E9E9E5] overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Prominent High-Quality Dining Table / Restaurant Interior Photo */}
            <div className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-full min-h-[320px] bg-gray-900 group overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
                alt="Elegant Table Arrangement and Dining Room"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent lg:hidden" />
              <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5B51B]">
                  Exquisite Hospitality
                </span>
                <p className="text-xs text-gray-200 mt-0.5">
                  Reserved tables are personally prepared 15 minutes before your arrival.
                </p>
              </div>
            </div>

            {/* Right Booking Card with Exact Requested Copy */}
            <div className="lg:col-span-6 p-8 sm:p-12 text-center lg:text-left space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center mx-auto lg:mx-0 border border-[#F5B51B]/30">
                <CalendarDays className="w-6 h-6 text-[#E9A817]" />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#E9A817]">
                  RESERVATIONS & PRIVATE DINING
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#17191C] leading-tight">
                  Planning a Special Gathering or Family Dinner?
                </h3>
                <p className="text-xs sm:text-sm text-[#686B70] leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Reserve your table in advance to enjoy personalized seating, custom celebration arrangements, and priority chef preparation.
                </p>
              </div>

              {/* Quick Perks */}
              <div className="grid grid-cols-2 gap-3 text-left pt-1">
                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E9E9E5] text-xs">
                  <span className="font-bold text-[#17191C] block">✓ Instant Confirmation</span>
                  <span className="text-[11px] text-gray-500">Live booking reference</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E9E9E5] text-xs">
                  <span className="font-bold text-[#17191C] block">✓ No Booking Fee</span>
                  <span className="text-[11px] text-gray-500">Free cancellation</span>
                </div>
              </div>

              <div>
                <Link
                  to="/reservations"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-sm transition-all shadow-md shadow-[#F5B51B]/20 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Book a Table Online</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER FORM */}
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
