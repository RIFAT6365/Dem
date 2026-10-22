import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MessageSquare,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Filter,
  ShieldCheck,
  CornerDownRight,
  Lock,
  UtensilsCrossed,
  X,
  ShoppingBag,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';

export const ReviewsPage: React.FC = () => {
  const { reviews, addReview, showToast, settings, orders } = useRestaurant();
  const { user, profile, isAuthenticated } = useAuth();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Eligible customer completed orders
  const customerOrders = orders.filter((o) => {
    const isOwner = o.userId === user?.id || (user?.email && o.customer?.email === user.email);
    return isOwner && (o.orderStatus === 'Completed' || (o as any).orderStatus === 'Delivered');
  });

  // Form state
  const [authorName, setAuthorName] = useState(
    profile?.fullName || user?.user_metadata?.full_name || ''
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-select first eligible order if modal opens
  useEffect(() => {
    if (customerOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(customerOrders[0].id);
      if (customerOrders[0].items.length > 0) {
        setSelectedProductId(customerOrders[0].items[0].productId);
        setSelectedProductName(customerOrders[0].items[0].name);
      }
    }
  }, [customerOrders, selectedOrderId]);

  // Update product selection when order changes
  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = customerOrders.find((o) => o.id === orderId);
    if (ord && ord.items.length > 0) {
      setSelectedProductId(ord.items[0].productId);
      setSelectedProductName(ord.items[0].name);
    }
  };

  const approvedReviews = reviews.filter((r) => r.isApproved);
  const filteredReviews =
    filterRating === 'all'
      ? approvedReviews
      : approvedReviews.filter((r) => r.rating === filterRating);

  // Average calculation
  const totalRatings = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating =
    approvedReviews.length > 0
      ? (totalRatings / approvedReviews.length).toFixed(1)
      : '5.0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('You must be signed in to submit a review.', 'error');
      return;
    }

    if (customerOrders.length === 0) {
      showToast('You must complete an eligible order before submitting a review.', 'error');
      return;
    }

    if (!comment.trim()) {
      showToast('Please provide your review feedback.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        orderId: selectedOrderId || undefined,
        productId: selectedProductId || undefined,
        productName: selectedProductName || undefined,
        authorName: (authorName.trim() || profile?.fullName || user.email?.split('@')[0] || 'Verified Customer'),
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        verifiedPurchase: true,
        authorAvatar: profile?.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      });

      setComment('');
      setTitle('');
      setRating(5);
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit review.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <Sparkles className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Real Guest Experiences</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Guest Reviews & Ratings
        </h1>
        <p className="text-xs sm:text-sm text-[#686B70] mt-2">
          Read genuine feedback from verified guests who dined with us or ordered takeaway delivery.
        </p>
      </div>

      {/* Rating Breakdown Summary Card */}
      <div className="bg-white p-8 rounded-3xl border border-[#E9E9E5] shadow-xs max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 text-center md:text-left md:border-r md:border-gray-100 md:pr-8">
          <span className="font-serif text-6xl font-extrabold text-[#07131A] leading-none block tabular-nums">
            {averageRating}
          </span>
          <div className="flex items-center justify-center md:justify-start gap-1 text-[#F5B51B] my-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#F5B51B]" />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium block">
            Based on {approvedReviews.length} verified dining ratings
          </span>

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 w-full py-3.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Write a Verified Review</span>
          </button>
        </div>

        {/* Rating bars */}
        <div className="md:col-span-7 space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = approvedReviews.filter((r) => r.rating === stars).length;
            const pct =
              approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 font-bold text-gray-700 flex items-center gap-1 font-sans">
                  {stars} <Star className="w-3 h-3 fill-[#F5B51B] text-[#F5B51B]" />
                </span>
                <div className="flex-grow h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F5B51B] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-400 font-medium font-sans tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setFilterRating('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterRating === 'all'
              ? 'bg-[#07131A] text-[#F5B51B] shadow-xs'
              : 'bg-white border border-[#E9E9E5] text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Stars ({approvedReviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = approvedReviews.filter((r) => r.rating === star).length;
          return (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                filterRating === star
                  ? 'bg-[#07131A] text-[#F5B51B] shadow-xs'
                  : 'bg-white border border-[#E9E9E5] text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{star} Stars</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E9E9E5] p-12 text-center max-w-lg mx-auto space-y-3">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-gray-800">No Reviews Found</h3>
          <p className="text-xs text-gray-500">
            Be the first guest to share feedback for this rating tier!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              id={rev.id}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E9E9E5] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        rev.authorAvatar ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={rev.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-[#F5B51B]/40"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-[#17191C] leading-tight">
                        {rev.authorName}
                      </h4>
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

                  {rev.verifiedPurchase && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>

                {rev.productName && (
                  <span className="inline-block text-[11px] font-semibold text-[#E9A817] bg-[#FFF8E7] px-2 py-0.5 rounded-md">
                    Dish: {rev.productName}
                  </span>
                )}

                {rev.title && (
                  <h5 className="font-bold text-sm text-gray-900 leading-snug">
                    {rev.title}
                  </h5>
                )}

                <p className="text-xs text-[#686B70] leading-relaxed">
                  “{rev.comment}”
                </p>

                {/* Restaurant Reply Display */}
                {rev.adminResponse && (
                  <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#F5B51B]/40 text-xs space-y-1.5 mt-3">
                    <div className="flex items-center gap-1.5 font-bold text-[#07131A] text-[11px]">
                      <CornerDownRight className="w-3.5 h-3.5 text-[#E9A817]" />
                      <span>Response from {settings.restaurantName} Manager:</span>
                    </div>
                    <p className="text-gray-700 italic pl-5 leading-relaxed">
                      {rev.adminResponse}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E9E9E5] flex items-center justify-between text-[11px] text-gray-400 font-sans">
                <span>{rev.date}</span>
                <span>{settings.restaurantName} Patron</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal with Strict Verification Check */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#07131A]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8E7] text-[#07131A] flex items-center justify-center border border-[#F5B51B]/40">
                  <Star className="w-5 h-5 text-[#E9A817] fill-[#E9A817]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-900">
                    Write a Dining Review
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    Verified Customer Dining Policy
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Check 1: User Not Signed In */}
            {!isAuthenticated ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Customer Sign-In Required</h4>
                    <p className="mt-1 leading-relaxed text-amber-800">
                      Under our verified dining transparency policy, reviews can only be posted by registered patrons with a completed order.
                    </p>
                  </div>
                </div>
                <Link
                  to="/login?redirect=/reviews"
                  className="w-full py-2.5 rounded-xl bg-[#07131A] hover:bg-black text-[#F5B51B] font-bold text-xs uppercase tracking-wider block text-center transition-colors"
                >
                  Sign In to Your Account
                </Link>
              </div>
            ) : customerOrders.length === 0 ? (
              /* Check 2: Signed In but No Completed Orders */
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-xs space-y-4">
                <div className="flex items-start gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-[#E9A817] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">
                      Order Completion Required for Reviews
                    </h4>
                    <p className="mt-1 leading-relaxed text-gray-600">
                      You are signed in as <strong>{user?.email}</strong>. To maintain the highest integrity, reviews are exclusively unlocked once an order has been delivered or completed.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200 text-[11px] text-gray-500">
                  Tip: Once you order online and enjoy your meal, a review button will immediately activate in your <strong>My Orders</strong> section.
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/order"
                    className="flex-1 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] font-bold text-xs uppercase tracking-wider text-center hover:bg-[#E9A817] transition-colors"
                  >
                    Explore Menu & Order
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* Eligible Customer Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Select Completed Order */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Select Completed Order for Verification
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] bg-white font-sans"
                    required
                  >
                    {customerOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        Order #{ord.orderNumber} ({ord.items.map((i) => i.name).slice(0, 2).join(', ')} — {settings.currencySymbol} {ord.total})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Your Star Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? 'fill-[#F5B51B] text-[#F5B51B]'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">
                      {rating === 5 ? 'Exceptional (5/5)' : `${rating} out of 5 Stars`}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Incredibly tender biryani and sublime spices"
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                  />
                </div>

                {/* Review details */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Your Review & Dining Experience
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the flavors, presentation, packaging, and delivery speed..."
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Verified Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
