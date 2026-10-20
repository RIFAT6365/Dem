import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { Product, ProductAddon } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';

interface QuickAddModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ product, onClose }) => {
  const { settings, addToCart } = useRestaurant();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [instructions, setInstructions] = useState('');

  if (!product) return null;

  const basePrice = product.salePrice ?? product.price;
  const addonsTotal = selectedAddons.reduce((acc, a) => acc + a.price, 0);
  const unitPrice = basePrice + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddon = (addon: ProductAddon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const handleConfirm = () => {
    addToCart(
      product,
      quantity,
      selectedAddons.map((a) => ({ addonId: a.id, name: a.name, price: a.price })),
      instructions
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header with image */}
        <div className="relative h-44 sm:h-52 bg-gray-900 shrink-0">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <h3 className="font-serif text-2xl font-bold leading-tight">{product.name}</h3>
            <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">{product.shortDescription}</p>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-grow">
          {/* Add-ons section */}
          {product.addons && product.addons.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                Customize with Add-ons (Optional)
              </h4>
              <div className="space-y-2">
                {product.addons.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                        isSelected
                          ? 'border-[#F5B51B] bg-[#FFF8E7] text-[#07131A] font-semibold'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#F5B51B] border-[#F5B51B] text-[#07131A]'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-900">
                        +{settings.currencySymbol} {addon.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special cooking instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Special Cooking Instructions (Optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Less spicy, extra sauce on the side, no onions..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#F5B51B] focus:ring-1 focus:ring-[#F5B51B]"
            />
          </div>

          {/* Quantity selector */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Quantity</span>
            <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:text-black"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-bold text-sm text-[#07131A]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-700 hover:text-black"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Total Price</span>
            <span className="text-xl font-extrabold text-[#07131A]">
              {settings.currencySymbol} {totalPrice}
            </span>
          </div>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-sm transition-all shadow-md shadow-[#F5B51B]/25 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart ({quantity})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
