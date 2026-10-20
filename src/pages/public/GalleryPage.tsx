import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { GalleryItem } from '../../types';

export const GalleryPage: React.FC = () => {
  const { gallery, settings } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ['All', 'Dishes', 'Ambience', 'Kitchen', 'Events'];

  const filteredItems = selectedCategory === 'All'
    ? gallery
    : gallery.filter((item) => item.category === selectedCategory);

  const activeItem: GalleryItem | null = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  return (
    <div className="py-12 space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E7] text-[#07131A] text-xs font-bold uppercase tracking-wider mb-2 border border-[#F5B51B]/40">
          <Sparkles className="w-3.5 h-3.5 text-[#E9A817]" />
          <span>Visual Moments</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#17191C]">
          Our Restaurant Gallery
        </h1>
        <p className="text-xs sm:text-sm text-[#686B70] mt-2">
          A glimpse into the soul of {settings.restaurantName}: handcrafted dishes, lively kitchen action, and our warm royal dining halls.
        </p>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#07131A] text-[#F5B51B] shadow-md'
                  : 'bg-white border border-[#E9E9E5] text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of gallery items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-[#E9E9E5] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase tracking-wider text-[#F5B51B] font-bold">
                {item.category}
              </span>
              <h3 className="font-serif text-base font-bold leading-snug mt-0.5">{item.title}</h3>
              {item.caption && (
                <p className="text-xs text-gray-300 line-clamp-1 mt-1">{item.caption}</p>
              )}
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white/90">
                <Eye className="w-3.5 h-3.5 text-[#F5B51B]" />
                <span>Click to view full photo</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox content */}
          <div className="max-w-4xl w-full flex flex-col items-center">
            <div className="max-h-[75vh] overflow-hidden rounded-2xl shadow-2xl border border-white/10">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                className="max-h-[75vh] w-auto object-contain mx-auto"
              />
            </div>
            <div className="text-center text-white mt-4 max-w-xl">
              <span className="text-xs uppercase tracking-widest text-[#F5B51B] font-bold">
                {activeItem.category}
              </span>
              <h3 className="font-serif text-2xl font-bold mt-1">{activeItem.title}</h3>
              {activeItem.caption && (
                <p className="text-sm text-gray-300 mt-1">{activeItem.caption}</p>
              )}
              <span className="text-xs text-gray-500 mt-2 block">
                {lightboxIndex! + 1} of {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
