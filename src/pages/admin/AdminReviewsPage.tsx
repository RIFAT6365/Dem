import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  EyeOff,
  Eye,
  Trash2,
  Search,
  Filter,
  MessageSquare,
  CornerDownRight,
  Send,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Review } from '../../types';

export const AdminReviewsPage: React.FC = () => {
  const { reviews, toggleReviewApproval, deleteReview, respondToReview } = useRestaurant();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const filtered = reviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.authorName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.productName && r.productName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenReply = (review: Review) => {
    setActiveReplyId(review.id);
    setReplyText(review.adminResponse || '');
  };

  const handleSaveReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      await respondToReview(reviewId, replyText.trim());
      setActiveReplyId(null);
      setReplyText('');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-gray-900 not-italic">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage public testimonials, approve or hide ratings, and publish official restaurant responses.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 5, 4, 3, 2, 1] as const).map((star) => (
            <button
              key={star}
              onClick={() => setFilterRating(star as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                filterRating === star
                  ? 'bg-[#07131A] text-[#F5B51B]'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {star === 'all' ? 'All Ratings' : `${star} Stars`}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews by dish name, customer or comment..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F5B51B]"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-bold">Author & Dish</th>
                <th className="p-4 font-bold">Rating</th>
                <th className="p-4 font-bold">Feedback</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Visibility</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Star className="w-7 h-7 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-600">No customer reviews found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Verified customer order feedback will be displayed here for moderation.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((rev) => (
                  <React.Fragment key={rev.id}>
                    <tr className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{rev.authorName}</div>
                        {rev.productName && (
                          <span className="text-[10px] text-[#E9A817] font-semibold block">
                            {rev.productName}
                          </span>
                        )}
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                            <ShieldCheck className="w-3 h-3" /> Verified Order
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-[#F5B51B]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-[#F5B51B]' : 'text-gray-200'
                              }`}
                            />
                          ))}
                          <span className="font-bold text-gray-800 ml-1.5 text-xs">{rev.rating}</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-sm">
                        {rev.title && (
                          <div className="font-bold text-gray-900 text-xs mb-0.5">{rev.title}</div>
                        )}
                        <p className="text-gray-700 leading-relaxed text-xs">“{rev.comment}”</p>

                        {/* Admin response snippet if present */}
                        {rev.adminResponse && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-gray-800">
                            <div className="flex items-center gap-1 font-bold text-amber-900 text-[10px] mb-0.5">
                              <CornerDownRight className="w-3 h-3 text-amber-700" />
                              <span>Official Response:</span>
                            </div>
                            <p className="italic text-gray-700">{rev.adminResponse}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-gray-400 text-[11px] whitespace-nowrap">{rev.date}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {rev.isApproved ? 'Published' : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenReply(rev)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700"
                            title="Reply to review"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleReviewApproval(rev.id)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold ${
                              rev.isApproved
                                ? 'border-gray-200 hover:bg-gray-100 text-gray-600'
                                : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            }`}
                            title={rev.isApproved ? 'Hide from public' : 'Approve & Publish'}
                          >
                            {rev.isApproved ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteReview(rev.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline Response Input Box */}
                    {activeReplyId === rev.id && (
                      <tr className="bg-amber-50/40">
                        <td colSpan={6} className="p-4">
                          <div className="max-w-2xl bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-[#E9A817]" />
                                Respond to {rev.authorName}&apos;s review
                              </span>
                              <button
                                onClick={() => setActiveReplyId(null)}
                                className="text-gray-400 hover:text-black"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type official restaurant response (e.g. Thank you for your review! We're glad you enjoyed the steak...)"
                              className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#F5B51B]"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setActiveReplyId(null)}
                                className="px-3 py-1.5 text-xs text-gray-600 hover:text-black"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveReply(rev.id)}
                                disabled={isSubmittingReply || !replyText.trim()}
                                className="px-3.5 py-1.5 rounded-lg bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                              >
                                <Send className="w-3 h-3" />
                                <span>{isSubmittingReply ? 'Saving...' : 'Post Response'}</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
