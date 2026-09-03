import React, { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import * as clothingService from '../services/clothingService';
import ClothingCard from '../components/ClothingCard';
import Loader from '../components/Loader';

const CATEGORIES = ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies', 'Sweaters', 'Dresses', 'Skirts', 'Shorts', 'Ethnic Wear', 'Sportswear', 'Formal Wear', 'Shoes', 'Accessories'];
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'highest_value', label: 'Highest value' },
  { value: 'lowest_value', label: 'Lowest value' },
];

const Listings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '', category: '', condition: '', location: '', sort: 'newest', page: 1,
  });

  const fetchItems = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data, meta: m } = await clothingService.getClothingList(params);
      setItems(data.items);
      setMeta(m);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    fetchItems(cleaned);
  }, [filters, fetchItems]);

  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Browse listings</h1>
          <p className="text-ink/50 mt-1">{meta.total ?? 0} pieces waiting for a new home.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              placeholder="Search by name or brand"
              value={filters.search}
              onChange={(e) => update('search', e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-moss-100 rounded-full text-sm w-64 focus:border-pine outline-none"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border border-moss-100 rounded-full px-4 py-2.5 text-sm hover:border-pine">
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 p-5 bg-moss-50 border border-moss-100 rounded-xl">
          <select value={filters.category} onChange={(e) => update('category', e.target.value)} className="border border-moss-100 rounded-lg px-3 py-2 text-sm">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.condition} onChange={(e) => update('condition', e.target.value)} className="border border-moss-100 rounded-lg px-3 py-2 text-sm">
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="City" value={filters.location} onChange={(e) => update('location', e.target.value)}
            className="border border-moss-100 rounded-lg px-3 py-2 text-sm" />
          <select value={filters.sort} onChange={(e) => update('sort', e.target.value)} className="border border-moss-100 rounded-lg px-3 py-2 text-sm">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setFilters({ search: '', category: '', condition: '', location: '', sort: 'newest', page: 1 })}
            className="text-sm text-thread hover:underline">Clear filters</button>
        </div>
      )}

      {loading ? <Loader /> : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink/50">No clothing items found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item) => <ClothingCard key={item._id} item={item} />)}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                  className={`w-9 h-9 rounded-full text-sm ${p === meta.page ? 'bg-pine text-paper' : 'border border-moss-100 hover:border-pine'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Listings;
