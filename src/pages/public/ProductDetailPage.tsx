import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Flame,
  Clock,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Leaf,
  ChefHat,
  MessageSquare,
  Share2,
  Lock,
  AlertCircle,
  CornerDownRight,
  Loader2,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import { ProductAddon } from '../../types';
import { ProductCard } from '../../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, categories, settings, addToCart, addReview, reviews, showToast } = useRestaurant();
  const { user, profile } = useAuth();

  const product = products.find((p) => p.slug === slug || p.id === slug);

  // Detail state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [instructions, setInstructions] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  // Review form state & purchase verification
  const [reviewName, setReviewName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; orderId?: string; reason?: string } | null>(null);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-gray-800">Dish Not Found</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          The requested menu item does not exist or has been removed.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Menu Items</span>
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const basePrice = product.salePrice ?? product.price;
  const addonsTotal = selectedAddons.reduce((acc, opt) => acc + opt.price, 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const handleAddToCart = () => {
    addToCart(
      product,
      quantity,
      selectedAddons.map((a) => ({ addonId: a.id, name: a.name, price: a.price })),
      instructions
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleReviewForm = async () => {
    if (showReviewForm) {
      setShowReviewForm(false);
      return;
    }

    if (!user) {
      setShowReviewForm(true);
      return;
    }

    setIsCheckingEligibility(true);
    try {
      const result = await reviewService.checkReviewEligibility(user.id, product.id);
      setEligibility(result);
      setReviewName(profile?.fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      setShowReviewForm(true);
    } catch {
      setEligibility({ eligible: false, reason: 'Could not verify dining order history.' });
      setShowReviewForm(true);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('You must be signed in to submit a review.', 'error');
      return;
    }

    if (!reviewComment.trim()) {
      showToast('Please provide your review feedback.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReview({
        productId: product.id,
        productName: product.name,
        orderId: eligibility?.orderId,
        authorName: reviewName.trim() || profile?.fullName || 'Customer',
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        verifiedPurchase: true,
      });

      setReviewTitle('');
      setReviewComment('');
      setShowReviewForm(false);
    } catch {
      // Toast notification is handled in context
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#F5B51B]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <Link to="/menu" className="hover:text-[#F5B51B]">Menu</Link>
          {category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <Link to={`/menu/category/${category.slug}`} className="hover:text-[#F5B51B]">
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-bold text-gray-800 truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-[#E9E9E5] shadow-sm">
          {/* Left Column: Gallery & Images */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.isBestseller && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#07131A] text-[#F5B51B] shadow">
                    Bestseller
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F5B51B] text-[#07131A] shadow">
                    Chef Recommends
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-[#F5B51B] scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Highlights guarantee */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
              <div className="p-3 bg-gray-50 rounded-xl">
                <Leaf className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-gray-800 block">100% Halal</span>
                <span className="text-[10px] text-gray-500">Certified Kitchen</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <ChefHat className="w-4 h-4 text-[#E9A817] mx-auto mb-1" />
                <span className="text-[11px] font-bold text-gray-800 block">Freshly Cooked</span>
                <span className="text-[10px] text-gray-500">Made to order</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <Clock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-[11px] font-bold text-gray-800 block">{product.prepTimeMinutes} Mins</span>
                <span className="text-[10px] text-gray-500">Prep Estimate</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Customization */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#E9A817] uppercase tracking-wider">
                  {category?.name || 'Specialty'}
                </span>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <div className="flex text-[#F5B51B]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F5B51B]" />
                    ))}
                  </div>
                  <span className="font-bold">{product.rating.toFixed(1)}</span>
                  <span className="text-gray-400">({product.reviewCount} customer reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#17191C] leading-tight">
                {product.name}
              </h1>

              {/* Price Banner */}
              <div className="flex items-baseline gap-3 pb-3 border-b border-gray-100">
                <span className="text-3xl font-extrabold text-[#07131A]">
                  {settings.currencySymbol} {basePrice}
                </span>
                {product.salePrice && product.salePrice < product.price && (
                  <span className="text-base text-gray-400 line-through">
                    {settings.currencySymbol} {product.price}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  Available in Dhaka
                </span>
              </div>

              {/* Dietary and Spice Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {product.dietaryLabels.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FAFAF8] border border-gray-200 text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
                {product.spiceLevel !== 'None' && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Spice: {product.spiceLevel}</span>
                  </span>
                )}
              </div>

              {/* Full Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.fullDescription}
              </p>

              {/* Ingredients list */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="pt-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Key Ingredients
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="px-2.5 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons Selection */}
              {product.addons && product.addons.length > 0 && (
                <div className="pt-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                    Optional Add-ons & Extras
                  </span>
                  <div className="space-y-2">
                    {product.addons.map((addon) => {
                      const isSelected = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddon(addon)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm transition-all ${
                            isSelected
                              ? 'border-[#F5B51B] bg-[#FFF8E7] font-semibold text-[#07131A]'
                              : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-sm flex items-center justify-center border ${
                                isSelected ? 'bg-[#F5B51B] border-[#F5B51B] text-[#07131A]' : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{addon.name}</span>
                          </div>
                          <span className="font-bold text-gray-900">
                            +{settings.currencySymbol} {addon.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cooking Instructions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Special Cooking Instructions
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Mild spice, extra sauce, well cooked..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>
            </div>

            {/* Bottom Actions: Quantity & Add to Cart */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4 bg-gray-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 hover:text-black font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-base text-[#07131A]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center text-gray-700 hover:text-black font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!product.isAvailable}
                className={`w-full flex-grow py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                  !product.isAvailable
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] shadow-[#F5B51B]/25 hover:shadow-lg'
                }`}
              >
                {isAdded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Added to Your Order!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      Add to Cart • {settings.currencySymbol} {totalPrice}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9E9E5] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#17191C]">
                Guest Reviews for {product.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Rated {product.rating.toFixed(1)} out of 5 based on verified diner ratings.
              </p>
            </div>
            <button
              onClick={handleToggleReviewForm}
              disabled={isCheckingEligibility}
              className="px-5 py-2.5 rounded-xl bg-[#07131A] text-[#F5B51B] text-xs font-bold hover:bg-black transition-colors self-start sm:self-auto flex items-center gap-1.5"
            >
              {isCheckingEligibility ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : showReviewForm ? (
                'Cancel Review'
              ) : (
                '+ Leave a Review'
              )}
            </button>
          </div>

          {/* Leave a review form or login gate */}
          {showReviewForm && (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4 animate-fadeIn">
              {!user ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#E9A817] flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-gray-900">
                      Sign In Required to Review
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                      To preserve authentic dining feedback, reviews can only be submitted by registered customers who have ordered and received this dish.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-3">
                    <Link
                      to={`/login?redirect=${encodeURIComponent(`/menu/${product.slug || product.id}`)}`}
                      className="px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817]"
                    >
                      Sign In to Review
                    </Link>
                  </div>
                </div>
              ) : eligibility && !eligibility.eligible ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-sm">Verified Purchase Required</h5>
                    <p className="mt-0.5 text-amber-800 leading-relaxed">
                      {eligibility.reason ||
                        'Reviews are only permitted after receiving a completed food delivery order for this dish.'}
                    </p>
                    <p className="mt-2 text-[11px] text-amber-700">
                      Once your order is marked Completed or Delivered, you will be able to share your verified dining experience here.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Write Your Verified Review
                    </h4>
                    {eligibility?.orderId && (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        Verified Order #{eligibility.orderId}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="e.g. Ayesha Siddiqua"
                        required
                        className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#F5B51B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Star Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#F5B51B]"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Exceptional)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                        <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                        <option value={2}>⭐⭐ (2 Stars - Below Expectation)</option>
                        <option value={1}>⭐ (1 Star - Poor)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Review Title (Optional)</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Perfectly cooked with authentic spices!"
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#F5B51B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Your Dining Feedback</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share details about flavor, portion size, and presentation..."
                      rows={3}
                      required
                      className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#F5B51B]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817] disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingReview && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSubmittingReview ? 'Submitting...' : 'Submit Verified Review'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Real Customer Reviews List */}
          <div className="space-y-4">
            {reviews
              .filter(
                (r) =>
                  r.isApproved &&
                  (r.productId === product.id ||
                    (r.productName && r.productName.toLowerCase() === product.name.toLowerCase()))
              )
              .map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-[#FAFAF8] border border-gray-100 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[#07131A] text-[#F5B51B] flex items-center justify-center font-bold text-xs shrink-0">
                    {rev.authorName ? rev.authorName.substring(0, 2).toUpperCase() : 'CU'}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-gray-900">{rev.authorName}</span>
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> Verified Order
                        </span>
                      )}
                      <div className="flex text-[#F5B51B]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-[#F5B51B]' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400 ml-auto">{rev.date}</span>
                    </div>

                    {rev.title && (
                      <h5 className="font-bold text-xs text-gray-900 mt-1">{rev.title}</h5>
                    )}
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Official Restaurant Response */}
                    {rev.adminResponse && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-gray-800">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] mb-1">
                          <CornerDownRight className="w-3.5 h-3.5 text-amber-700" />
                          <span>Restaurant Response:</span>
                        </div>
                        <p className="italic text-gray-700">{rev.adminResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

            {reviews.filter(
              (r) =>
                r.isApproved &&
                (r.productId === product.id ||
                  (r.productName && r.productName.toLowerCase() === product.name.toLowerCase()))
            ).length === 0 && (
              <div className="py-8 text-center text-gray-400 text-xs">
                <Star className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="font-semibold text-gray-600">No reviews yet for {product.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Order this dish to be the first customer to share verified feedback!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl font-bold text-[#17191C]">
              You May Also Relish
            </h3>
            <Link to="/menu" className="text-xs font-bold text-[#E9A817] hover:underline">
              View All Menu →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
