import React, { useState } from 'react';
import { Star, MessageSquare, Plus, CheckCircle2, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const ReviewsPage: React.FC = () => {
  const { reviews, addReview, showToast, settings } = useRestaurant();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const approvedReviews = reviews.filter((r) => r.isApproved);
  const filteredReviews = filterRating === 'all'
    ? approvedReviews
    : approvedReviews.filter((r) => r.rating === filterRating);

  // Average calculation
  const totalRatings = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = approvedReviews.length > 0 ? (totalRatings / approvedReviews.length).toFixed(1) : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      showToast('Please provide your name and review details.', 'error');
      return;
    }

    addReview({
      authorName: authorName.trim(),
      rating,
      comment: comment.trim(),
      verifiedPurchase: true,
      authorAvatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
    });

    setAuthorName('');
    setComment('');
    setRating(5);
    setIsModalOpen(false);
  };

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          Read genuine feedback from guests who dined with us or ordered takeaway delivery.
        </p>
      </div>

      {/* Demo Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 max-w-3xl mx-auto">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Demo Notice: </span>
          <span>
            These testimonials and reviews are part of the demo dataset. You can submit new reviews below, and they will persist in your local storage.
          </span>
        </div>
      </div>

      {/* Rating Breakdown Summary Card */}
      <div className="bg-white p-8 rounded-3xl border border-[#E9E9E5] shadow-sm max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 text-center md:text-left md:border-r md:border-gray-100 md:pr-8">
          <span className="font-serif text-6xl font-extrabold text-[#07131A] leading-none block">
            {averageRating}
          </span>
          <div className="flex items-center justify-center md:justify-start gap-1 text-[#F5B51B] my-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#F5B51B]" />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium block">
            Based on {approvedReviews.length} verified ratings
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 w-full py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating bars */}
        <div className="md:col-span-7 space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = approvedReviews.filter((r) => r.rating === stars).length;
            const pct = approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 font-bold text-gray-700 flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-[#F5B51B] text-[#F5B51B]" />
                </span>
                <div className="flex-grow h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F5B51B] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-400 font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setFilterRating('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold ${
            filterRating === 'all'
              ? 'bg-[#07131A] text-[#F5B51B]'
              : 'bg-white border border-[#E9E9E5] text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Stars ({approvedReviews.length})
        </button>
        {[5, 4, 3].map((star) => (
          <button
            key={star}
            onClick={() => setFilterRating(star)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 ${
              filterRating === star
                ? 'bg-[#07131A] text-[#F5B51B]'
                : 'bg-white border border-[#E9E9E5] text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{star} Stars</span>
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white p-6 rounded-3xl border border-[#E9E9E5] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={rev.authorName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#F5B51B]/40"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-[#17191C] leading-tight">{rev.authorName}</h4>
                    <span className="text-[11px] text-gray-400">{rev.date}</span>
                  </div>
                </div>
                <div className="flex text-[#F5B51B]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-[#F5B51B]' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {rev.productName && (
                <div className="text-[11px] font-semibold text-[#E9A817] mb-2 bg-[#FFF8E7] px-2.5 py-1 rounded-md inline-block">
                  Ordered: {rev.productName}
                </div>
              )}

              <p className="text-xs text-gray-600 leading-relaxed italic">
                “{rev.comment}”
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Guest
              </span>
              <span>Dine-in & Online Delivery</span>
            </div>
          </div>
        ))}
      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100">
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-1">
              Leave Your Experience Review
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Your feedback helps us continuously elevate our royal flavors and services.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Nusrat Jahan"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
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
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked about the food, delivery speed, or table atmosphere..."
                  rows={4}
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] text-xs font-bold transition-all shadow-md"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
