import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Utensils, Sparkles, ChefHat } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ProductCard } from '../../components/common/ProductCard';
import { QuickAddModal } from '../../components/common/QuickAddModal';
import { Product } from '../../types';

export const MenuPage: React.FC = () => {
  const { products, categories, settings } = useRestaurant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quickAddProduct, setQuickAddProduct] = useState<Product | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [selectedSpice, setSelectedSpice] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(350);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'name'>('popular');

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(query);
          const matchesDesc = product.shortDescription.toLowerCase().includes(query);
          const matchesIng = product.ingredients.some((ing) => ing.toLowerCase().includes(query));
          if (!matchesName && !matchesDesc && !matchesIng) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
          return false;
        }

        // Dietary filter
        if (selectedDietary !== 'all') {
          if (!product.dietaryLabels.some((label) => label.toLowerCase().includes(selectedDietary.toLowerCase()))) {
            return false;
          }
        }

        // Spice filter
        if (selectedSpice !== 'all' && product.spiceLevel !== selectedSpice) {
          return false;
        }

        // Price filter
        const price = product.salePrice ?? product.price;
        if (price > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // Popular default
        if (a.isBestseller && !b.isBestseller) return -1;
        if (!a.isBestseller && b.isBestseller) return 1;
        return b.rating - a.rating;
      });
  }, [products, searchQuery, selectedCategory, selectedDietary, selectedSpice, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDietary('all');
    setSelectedSpice('all');
    setMaxPrice(350);
    setSortBy('popular');
  };

  return (
    <div className="py-10 space-y-10">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <ChefHat className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Royal Culinary Collection</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Our Complete Menu
        </h1>
        <p className="text-xs sm:text-sm text-[#686B70] mt-2 max-w-xl mx-auto">
          Explore our complete selection of slow-cooked biryanis, sizzling kebabs, rich curries, hand-crafted burgers, and traditional sweets.
        </p>
      </div>

      {/* Main Filter & Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Sort Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E9E9E5] shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes, ingredients (e.g. biryani, ghee, naan)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#F5B51B] focus:ring-1 focus:ring-[#F5B51B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Category Tabs scrollable */}
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#07131A] text-[#F5B51B]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Dishes ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#07131A] text-[#F5B51B]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sorting */}
          <div className="w-full md:w-auto flex items-center justify-end gap-2 text-xs">
            <span className="text-gray-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#F5B51B] bg-white cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Secondary filters row (Dietary, Spice, Max Price) */}
        <div className="bg-[#FAFAF8] p-4 rounded-xl border border-[#E9E9E5] mb-8 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-gray-700 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E9A817]" /> Filters:
            </span>

            {/* Dietary */}
            <select
              value={selectedDietary}
              onChange={(e) => setSelectedDietary(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
            >
              <option value="all">Dietary: All</option>
              <option value="halal">Halal</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="special">Chef's Special</option>
            </select>

            {/* Spice */}
            <select
              value={selectedSpice}
              onChange={(e) => setSelectedSpice(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
            >
              <option value="all">Spice Level: All</option>
              <option value="None">Mild / None</option>
              <option value="Medium">Medium</option>
              <option value="Hot">Hot</option>
              <option value="Extra Hot">Extra Hot</option>
            </select>

            {/* Max Price slider */}
            <div className="flex items-center gap-2 pl-2">
              <span className="text-gray-600">Max: {settings.currencySymbol} {maxPrice}</span>
              <input
                type="range"
                min="50"
                max="350"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-[#F5B51B] cursor-pointer"
              />
            </div>
          </div>

          {(selectedCategory !== 'all' || selectedDietary !== 'all' || selectedSpice !== 'all' || searchQuery || maxPrice < 350) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[#E9A817] hover:underline font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
          <span>Showing <strong>{filteredProducts.length}</strong> items</span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickAdd={(p) => setQuickAddProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E9E9E5] p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-gray-800">No dishes found</h3>
            <p className="text-xs text-gray-500">
              We couldn't find any dishes matching your current search or filters. Try adjusting your query or resetting filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817] transition-all"
            >
              Show All Menu Dishes
            </button>
          </div>
        )}
      </div>

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
