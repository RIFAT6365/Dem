import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChefHat, Sparkles } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ProductCard } from '../../components/common/ProductCard';
import { QuickAddModal } from '../../components/common/QuickAddModal';
import { Product } from '../../types';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, products, settings } = useRestaurant();
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  const category = categories.find((c) => c.slug === slug || c.id === slug);
  const categoryProducts = category
    ? products.filter((p) => p.categoryId === category.id)
    : [];

  if (!category) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-gray-800">Category Not Found</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          The requested menu category does not exist or has been relocated.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Category Hero Banner */}
      <div className="relative h-64 sm:h-80 bg-gray-900 overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07131A] via-[#07131A]/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 text-white">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-[#F5B51B] mb-3 w-fit transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Menu Categories</span>
          </Link>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#F5B51B] font-bold">
            <ChefHat className="w-4 h-4" />
            <span>Category Collection</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mt-1 text-white">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mt-2 leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <span className="text-xs font-semibold text-gray-600">
            {categoryProducts.length} dishes in this category
          </span>
          <div className="flex items-center gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/menu/category/${c.slug}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  c.id === category.id
                    ? 'bg-[#07131A] text-[#F5B51B] font-bold'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickAdd={(p) => setQuickAddProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E9E9E5] p-12 text-center max-w-md mx-auto">
            <p className="text-sm text-gray-600">No dishes currently available in this category.</p>
            <Link
              to="/menu"
              className="mt-4 inline-block px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold"
            >
              Browse Full Menu
            </Link>
          </div>
        )}
      </div>

      {quickAddProduct && (
        <QuickAddModal
          product={quickAddProduct}
          onClose={() => setQuickAddProduct(null)}
        />
      )}
    </div>
  );
};
