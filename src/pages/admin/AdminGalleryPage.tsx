import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Image as ImageIcon, Eye, X, HardDrive } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { GalleryItem } from '../../types';

export const AdminGalleryPage: React.FC = () => {
  const { gallery, addGalleryItem, deleteGalleryItem } = useRestaurant();
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryItem['category']>('Dishes');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const samplePhotoPresets = [
    { title: 'Tandoori Sizzle Platter', cat: 'Dishes', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=80' },
    { title: 'Outdoor Garden Terrace', cat: 'Ambience', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80' },
    { title: 'Clay Oven Baking Action', cat: 'Kitchen', url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1000&q=80' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    addGalleryItem({
      title: title.trim(),
      category,
      imageUrl: imageUrl.trim(),
      caption: caption.trim(),
    });

    setTitle('');
    setImageUrl('');
    setCaption('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans not-italic text-2xl sm:text-3xl font-bold text-gray-900">
            Gallery Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Curate visual moments of food presentation, restaurant atmosphere, and culinary events.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/drive"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs transition-colors border border-gray-300 shadow-2xs"
          >
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Drive Photos</span>
          </Link>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Photo to Gallery</span>
          </button>
        </div>
      </div>

      {/* Grid of gallery cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#07131A]/90 text-[#F5B51B]">
                {item.category}
              </span>
            </div>

            <div className="p-4 flex flex-col justify-between flex-grow">
              <div>
                <h3 className="font-bold text-xs text-gray-900 line-clamp-1">{item.title}</h3>
                {item.caption && (
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.caption}</p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => deleteGalleryItem(item.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Photo Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-sans not-italic text-xl font-bold text-gray-900">
                Add Photo to Gallery
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clay Oven Garlic Naan Sizzle"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="Dishes">Dishes & Food</option>
                  <option value="Ambience">Ambience & Decor</option>
                  <option value="Kitchen">Kitchen & Cooking</option>
                  <option value="Events">Events & Celebrations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  required
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              <div>
                <span className="block text-[11px] text-gray-500 mb-1.5 font-medium">Quick Preset Photo:</span>
                <div className="flex gap-2">
                  {samplePhotoPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTitle(p.title);
                        setCategory(p.cat as any);
                        setImageUrl(p.url);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 text-[11px] hover:bg-gray-200"
                    >
                      {p.cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Caption / Description
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Short description..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#F5B51B]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#F5B51B] text-[#07131A] text-xs font-bold hover:bg-[#E9A817]"
                >
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
