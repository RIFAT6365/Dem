import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Flame, Check, Plus } from 'lucide-react';
import { Product } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';

interface ProductCardProps {
  product: Product;
  onOpenQuickAdd?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenQuickAdd }) => {
  const { settings, addToCart } = useRestaurant();
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has addons, open the customize modal or add directly
    if (product.addons && product.addons.length > 0 && onOpenQuickAdd) {
      onOpenQuickAdd(product);
      return;
    }

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const currentPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#E9E9E5] hover:border-[#F5B51B]/80 hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Dietary / Bestseller Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.isBestseller && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#07131A] text-[#F5B51B] shadow">
              Bestseller
            </span>
          )}
          {product.dietaryLabels[0] && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/95 text-gray-800 shadow backdrop-blur-sm">
              {product.dietaryLabels[0]}
            </span>
          )}
        </div>

        {/* Spice Level Indicator */}
        {product.spiceLevel !== 'None' && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#07131A]/80 text-white backdrop-blur-sm flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#F5B51B]" />
            <span>{product.spiceLevel}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Rating and Reviews */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <div className="flex items-center gap-1 text-[#E9A817]">
            <Star className="w-3.5 h-3.5 fill-[#F5B51B] text-[#F5B51B]" />
            <span className="font-bold text-gray-800">{product.rating.toFixed(1)}</span>
            <span className="text-gray-400">({product.reviewCount})</span>
          </div>
          <span className="text-[11px] text-gray-500">{product.prepTimeMinutes} mins</span>
        </div>

        {/* Title */}
        <Link to={`/product/${product.slug}`} className="block group-hover:text-[#F5B51B] transition-colors">
          <h3 className="font-serif text-lg font-bold text-[#17191C] leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-[#686B70] mt-1.5 line-clamp-2 leading-relaxed flex-grow">
          {product.shortDescription}
        </p>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-[#E9E9E5] flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-[#07131A]">
                {settings.currencySymbol} {currentPrice}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {settings.currencySymbol} {product.price}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Demo Price</span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!product.isAvailable}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 ${
              !product.isAvailable
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] hover:shadow-md hover:shadow-[#F5B51B]/25'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added</span>
              </>
            ) : product.addons && product.addons.length > 0 ? (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
