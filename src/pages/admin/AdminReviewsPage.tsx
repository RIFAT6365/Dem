import React, { useState } from 'react';
import { Star, CheckCircle2, EyeOff, Eye, Trash2, Search, Filter } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const AdminReviewsPage: React.FC = () => {
  const { reviews, toggleReviewApproval, deleteReview } = useRestaurant();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = reviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return r.authorName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-2xl sm:text-3xl font-bold text-gray-900 not-italic">
            Customer Reviews Moderation
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage public testimonials, approve or hide ratings, and maintain dining feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {([ 'all', 5, 4, 3 ] as const).map((star) => (
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

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-bold">Author</th>
                <th className="p-4 font-bold">Rating</th>
                <th className="p-4 font-bold">Comment</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Visibility</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((rev) => (
                <tr key={rev.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{rev.authorName}</div>
                    {rev.productName && (
                      <span className="text-[10px] text-[#E9A817] font-semibold">{rev.productName}</span>
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
                    <p className="text-gray-700 leading-relaxed text-xs not-italic">“{rev.comment}”</p>
                  </td>
                  <td className="p-4 text-gray-400 text-[11px] whitespace-nowrap">{rev.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {rev.isApproved ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleReviewApproval(rev.id)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold ${
                          rev.isApproved
                            ? 'border-gray-200 hover:bg-gray-100 text-gray-600'
                            : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        }`}
                        title={rev.isApproved ? 'Hide from public' : 'Approve & Show'}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
