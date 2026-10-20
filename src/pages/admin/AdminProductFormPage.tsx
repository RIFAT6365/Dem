import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  Flame,
  Eye,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Product, ProductAddon, SpiceLevel } from '../../types';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, settings, addProduct, updateProduct, showToast } = useRestaurant();

  const isEdit = Boolean(id);
  const existingProduct = isEdit ? products.find((p) => p.id === id) : null;

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [secondaryImageUrl, setSecondaryImageUrl] = useState('');
  const [price, setPrice] = useState(180);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [hasSalePrice, setHasSalePrice] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>('Medium');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(20);
  const [ingredientsText, setIngredientsText] = useState('Basmati Rice, Pure Ghee, Saffron, Garlic');
  const [dietaryTags, setDietaryTags] = useState<string[]>(['Halal']);
  const [customTag, setCustomTag] = useState('');
  const [addons, setAddons] = useState<ProductAddon[]>([
    { id: 'opt-1', name: 'Extra Boiled Egg', price: 20 },
  ]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');

  // Sample food images for quick selection
  const sampleImages = [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
  ];

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  useEffect(() => {
    if (isEdit && existingProduct) {
      setName(existingProduct.name);
      setSlug(existingProduct.slug);
      setShortDesc(existingProduct.shortDescription);
      setFullDesc(existingProduct.fullDescription);
      setCategoryId(existingProduct.categoryId);
      setImageUrl(existingProduct.images[0] || '');
      setSecondaryImageUrl(existingProduct.images[1] || '');
      setPrice(existingProduct.price);
      if (existingProduct.salePrice) {
        setHasSalePrice(true);
        setSalePrice(existingProduct.salePrice);
      }
      setIsAvailable(existingProduct.isAvailable);
      setIsFeatured(existingProduct.isFeatured);
      setIsBestseller(existingProduct.isBestseller);
      setSpiceLevel(existingProduct.spiceLevel);
      setPrepTimeMinutes(existingProduct.prepTimeMinutes);
      setIngredientsText(existingProduct.ingredients.join(', '));
      setDietaryTags(existingProduct.dietaryLabels);
      setAddons(existingProduct.addons || []);
      setSeoTitle(existingProduct.seoTitle || '');
      setSeoDesc(existingProduct.seoDescription || '');
    }
  }, [isEdit, existingProduct]);

  // Auto generate slug
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const addAddon = () => {
    setAddons((prev) => [
      ...prev,
      { id: `opt-${Date.now()}`, name: 'New Addon Option', price: 30 },
    ]);
  };

  const removeAddon = (idx: number) => {
    setAddons((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateAddon = (idx: number, field: 'name' | 'price', value: any) => {
    setAddons((prev) =>
      prev.map((addon, i) =>
        i === idx ? { ...addon, [field]: field === 'price' ? Number(value) : value } : addon
      )
    );
  };

  const addTag = (tag: string) => {
    if (tag && !dietaryTags.includes(tag)) {
      setDietaryTags([...dietaryTags, tag]);
    }
    setCustomTag('');
  };

  const removeTag = (tag: string) => {
    setDietaryTags(dietaryTags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !slug.trim()) {
      showToast('Please provide a dish name and URL slug.', 'error');
      return;
    }

    const images = [imageUrl || sampleImages[0]];
    if (secondaryImageUrl) images.push(secondaryImageUrl);

    const ingredients = ingredientsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const productPayload = {
      name: name.trim(),
      slug: slug.trim(),
      shortDescription: shortDesc.trim() || 'Freshly prepared specialty dish.',
      fullDescription: fullDesc.trim() || shortDesc.trim(),
      categoryId,
      images,
      price: Number(price),
      salePrice: hasSalePrice && salePrice ? Number(salePrice) : undefined,
      isAvailable,
      isFeatured,
      isBestseller,
      ingredients,
      dietaryLabels: dietaryTags,
      spiceLevel,
      prepTimeMinutes: Number(prepTimeMinutes),
      addons,
      rating: existingProduct ? existingProduct.rating : 5.0,
      reviewCount: existingProduct ? existingProduct.reviewCount : 1,
      seoTitle: seoTitle.trim() || `${name} | ${settings.restaurantName}`,
      seoDescription: seoDesc.trim() || shortDesc.trim(),
    };

    if (isEdit && id) {
      updateProduct(id, productPayload);
    } else {
      addProduct(productPayload);
    }

    navigate('/admin/products');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-sans not-italic text-2xl font-bold text-gray-900">
              {isEdit ? `Edit Dish: ${existingProduct?.name}` : 'Create New Menu Item'}
            </h1>
            <p className="text-xs text-gray-500">
              {isEdit ? 'Update details, pricing, and availability' : 'Add a mouthwatering new dish to your restaurant menu'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{isEdit ? 'Save Changes' : 'Publish Dish'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: General Info */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">1</span>
            General Dish Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Chicken Biryani"
                required
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. royal-chicken-biryani"
                required
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Short Description (Card Summary) *
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="e.g. Traditional chicken biryani with aromatic spices and saffron-infused basmati."
              required
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Full Culinary Description
            </label>
            <textarea
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              placeholder="Describe the aroma, texture, slow-cooking process, and chef preparation..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>
        </div>

        {/* Section 2: Product Images */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">2</span>
            Product Photography & Media
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-8 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Primary Image URL *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Secondary Gallery Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={secondaryImageUrl}
                  onChange={(e) => setSecondaryImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              <div>
                <span className="block text-xs text-gray-500 mb-2 font-medium">Or choose a preset sample photo:</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {sampleImages.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(src)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        imageUrl === src ? 'border-[#F5B51B] scale-105' : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="md:col-span-4">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Live Image Preview
              </span>
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={imageUrl || sampleImages[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 & 4: Category & Pricing */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">3</span>
            Category, Classification & Pricing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Regular Price ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Sale Price (Optional)
                </label>
                <input
                  type="checkbox"
                  checked={hasSalePrice}
                  onChange={(e) => setHasSalePrice(e.target.checked)}
                  className="accent-[#F5B51B]"
                />
              </div>
              <input
                type="number"
                min="0"
                disabled={!hasSalePrice}
                value={salePrice ?? ''}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                placeholder="Discounted price"
                className={`w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] ${
                  !hasSalePrice ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section 5: Ingredients, Spice & Dietary */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">4</span>
            Ingredients, Dietary & Spice Level
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Spice Level
              </label>
              <select
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(e.target.value as SpiceLevel)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B] bg-white"
              >
                <option value="None">Mild / None</option>
                <option value="Mild">Mild</option>
                <option value="Medium">Medium</option>
                <option value="Hot">Hot</option>
                <option value="Extra Hot">Extra Hot</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Estimated Prep Time (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={prepTimeMinutes}
                onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Ingredients List (Comma separated)
            </label>
            <input
              type="text"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="e.g. Basmati Rice, Ghee, Saffron, Garlic, Cardamom"
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
            />
          </div>

          {/* Dietary tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Dietary & Feature Badges
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"
                >
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)} className="text-emerald-700 hover:text-red-600 font-bold">
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add badge (e.g. Halal, Chef Special, Keto)"
                className="text-xs p-2 rounded-lg border border-gray-300 flex-grow"
              />
              <button
                type="button"
                onClick={() => addTag(customTag.trim())}
                className="px-3 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Add-ons & Variations */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">5</span>
              Add-ons & Variations
            </h2>
            <button
              type="button"
              onClick={addAddon}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800"
            >
              + Add Option
            </button>
          </div>

          {addons.length === 0 ? (
            <p className="text-xs text-gray-400">No add-ons created. Click "+ Add Option" to offer extras like extra eggs, dips, or combo drinks.</p>
          ) : (
            <div className="space-y-2">
              {addons.map((addon, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={addon.name}
                    onChange={(e) => updateAddon(index, 'name', e.target.value)}
                    placeholder="Addon name (e.g. Extra Egg)"
                    className="flex-grow text-xs p-2.5 rounded-xl border border-gray-300"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">{settings.currencySymbol}</span>
                    <input
                      type="number"
                      min="0"
                      value={addon.price}
                      onChange={(e) => updateAddon(index, 'price', e.target.value)}
                      className="w-20 text-xs p-2.5 rounded-xl border border-gray-300"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddon(index)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 7: Availability & Visibility Toggles */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="font-sans not-italic text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="w-5 h-5 rounded-full bg-[#07131A] text-[#F5B51B] text-[10px] font-bold flex items-center justify-center">6</span>
            Visibility & Badges
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#F5B51B]"
              />
              <div>
                <span className="block text-xs font-bold text-gray-900">In Stock & Ready</span>
                <span className="block text-[10px] text-gray-400">Can be ordered online</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 accent-[#F5B51B]"
              />
              <div>
                <span className="block text-xs font-bold text-gray-900">Bestseller Dish</span>
                <span className="block text-[10px] text-gray-400">Displays gold badge</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#F5B51B]"
              />
              <div>
                <span className="block text-xs font-bold text-gray-900">Featured on Homepage</span>
                <span className="block text-[10px] text-gray-400">Shows in hero popular list</span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isEdit ? 'Update Dish Record' : 'Publish Dish to Menu'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
