import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  X,
  AlertTriangle,
  Star,
  Flame,
  Utensils,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Product } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const { products, categories, settings, deleteProduct, duplicateProduct, updateProduct } = useRestaurant();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = products.filter((p) => {
    if (selectedCat !== 'all' && p.categoryId !== selectedCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteProduct(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-gray-900">
            Food Menu Catalog
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your dishes, adjust pricing, update availability, and add new chef creations.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Dish</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish by name or description..."
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F5B51B]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-auto text-xs px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-medium focus:outline-none focus:border-[#F5B51B]"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-bold">Dish</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Spice / Diet</th>
                <th className="p-4 font-bold">In Stock</th>
                <th className="p-4 font-bold">Bestseller</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => {
                const category = categories.find((c) => c.id === product.categoryId);
                return (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    {/* Image and title */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block leading-tight text-sm">
                            {product.name}
                          </span>
                          <span className="text-[11px] text-gray-400 block mt-0.5 truncate max-w-xs">
                            {product.shortDescription}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 font-semibold text-gray-700">
                      {category?.name || 'Uncategorized'}
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="font-bold font-sans text-gray-900 text-sm tabular-nums not-italic">
                        <span className="font-sans font-bold">{settings.currencySymbol}</span> {product.salePrice ?? product.price}
                      </div>
                      {product.salePrice && product.salePrice < product.price && (
                        <div className="text-[10px] font-sans text-gray-400 line-through tabular-nums not-italic">
                          <span className="font-sans">{settings.currencySymbol}</span> {product.price}
                        </div>
                      )}
                    </td>

                    {/* Spice / Diet */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {product.dietaryLabels[0] && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                            {product.dietaryLabels[0]}
                          </span>
                        )}
                        {product.spiceLevel !== 'None' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-50 text-red-700 font-semibold border border-red-200 flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" /> {product.spiceLevel}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* In Stock Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => updateProduct(product.id, { isAvailable: !product.isAvailable })}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          product.isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    {/* Bestseller Toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => updateProduct(product.id, { isBestseller: !product.isBestseller })}
                        className={`p-1.5 rounded-lg border transition-all ${
                          product.isBestseller
                            ? 'bg-[#FFF8E7] border-[#F5B51B] text-[#E9A817]'
                            : 'border-gray-200 text-gray-300 hover:text-gray-500'
                        }`}
                        title="Toggle Bestseller Badge"
                      >
                        <Star className={`w-4 h-4 ${product.isBestseller ? 'fill-[#F5B51B]' : ''}`} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/product/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                          title="Preview on Public Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => duplicateProduct(product.id)}
                          className="p-1.5 text-gray-400 hover:text-[#07131A] rounded-lg"
                          title="Duplicate Dish"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit Dish"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirmId(product.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Menu Dish?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete this menu item? It will be removed from your catalog and will no longer appear on the public website.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Yes, Delete Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
