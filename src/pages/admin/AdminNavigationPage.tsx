import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Eye, EyeOff, Save, Navigation as NavIcon } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { NavigationLink } from '../../types';

export const AdminNavigationPage: React.FC = () => {
  const { navLinks, updateNavLinks } = useRestaurant();
  const [links, setLinks] = useState<NavigationLink[]>([...navLinks].sort((a, b) => a.order - b.order));

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index - 1];
    newLinks[index - 1] = temp;
    newLinks.forEach((l, idx) => (l.order = idx + 1));
    setLinks(newLinks);
  };

  const moveDown = (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index + 1];
    newLinks[index + 1] = temp;
    newLinks.forEach((l, idx) => (l.order = idx + 1));
    setLinks(newLinks);
  };

  const toggleVisibility = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isVisible: !l.isVisible } : l))
    );
  };

  const updateLabel = (id: string, newLabel: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, label: newLabel } : l))
    );
  };

  const handleSave = () => {
    updateNavLinks(links);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="font-sans text-2xl font-bold text-gray-900 not-italic">
            Public Navigation Menu Management
          </h1>
          <p className="text-xs text-gray-500">
            Customize header link labels, arrange priority order, and toggle visibility.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#F5B51B] hover:bg-[#E9A817] text-[#07131A] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F5B51B]/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Navigation Menu</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
          <span>Navigation Link Order & Label</span>
          <span>Visibility & Reorder</span>
        </div>

        <div className="divide-y divide-gray-100">
          {links.map((link, index) => (
            <div
              key={link.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
            >
              <div className="flex items-center gap-3 flex-grow max-w-md">
                <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLabel(link.id, e.target.value)}
                  className="text-xs font-bold text-gray-900 p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#F5B51B] flex-grow"
                />
                <span className="text-[11px] font-sans font-medium text-gray-400 shrink-0 not-italic">
                  {link.path}
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => toggleVisibility(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    link.isVisible
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {link.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{link.isVisible ? 'Visible' : 'Hidden'}</span>
                </button>

                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    className="p-1.5 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === links.length - 1}
                    onClick={() => moveDown(index)}
                    className="p-1.5 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
