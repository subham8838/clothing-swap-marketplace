import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X } from 'lucide-react';
import * as clothingService from '../services/clothingService';
import { getErrorMessage } from '../services/api';

const CATEGORIES = ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies', 'Sweaters', 'Dresses', 'Skirts', 'Shorts', 'Ethnic Wear', 'Sportswear', 'Formal Wear', 'Shoes', 'Accessories'];
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];

const CreateListing = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files).slice(0, 6 - images.length);
    const withPreview = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...withPreview].slice(0, 6));
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (values) => {
    if (images.length === 0) { setError('At least one image is required.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key === 'city' || key === 'state') return;
        if (val !== undefined && val !== '') formData.append(key, val);
      });
      formData.append('location[city]', values.city);
      formData.append('location[state]', values.state || '');
      formData.append('location[country]', 'India');
      images.forEach((img) => formData.append('images', img.file));

      const { data } = await clothingService.createClothing(formData);
      navigate(`/listings/${data.item._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-2">List an item</h1>
      <p className="text-ink/50 mb-8">Give your piece a fresh start with someone else.</p>

      {error && <div className="mb-6 text-sm bg-red-50 text-thread border border-red-100 rounded-lg px-4 py-3">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-2">Photos (up to 6, first is the cover)</label>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-moss-100">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-ink/60 text-paper rounded-full p-0.5">
                  <X size={14} />
                </button>
                {idx === 0 && <span className="absolute bottom-1 left-1 badge bg-pine text-paper text-[9px]">Cover</span>}
              </div>
            ))}
            {images.length < 6 && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-moss-100 flex flex-col items-center justify-center cursor-pointer hover:border-pine text-ink/40">
                <UploadCloud size={22} />
                <span className="text-xs mt-1">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Title</label>
          <input {...register('title', { required: 'Title is required' })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5 focus:border-pine outline-none" />
          {errors.title && <p className="text-xs text-thread mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Description</label>
          <textarea {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'At least 10 characters' } })}
            className="w-full border border-moss-100 rounded-lg px-4 py-2.5 h-28 resize-none focus:border-pine outline-none" />
          {errors.description && <p className="text-xs text-thread mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Category</label>
            <select {...register('category', { required: 'Category is required' })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5">
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-thread mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Condition</label>
            <select {...register('condition', { required: 'Condition is required' })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5">
              <option value="">Select…</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.condition && <p className="text-xs text-thread mt-1">{errors.condition.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Brand</label>
            <input {...register('brand', { required: 'Brand is required' })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
            {errors.brand && <p className="text-xs text-thread mt-1">{errors.brand.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Size</label>
            <input {...register('size', { required: 'Size is required' })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
            {errors.size && <p className="text-xs text-thread mt-1">{errors.size.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Colour</label>
            <input {...register('color')} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Estimated value (₹, optional — auto-calculated if blank)</label>
            <input type="number" min="0" {...register('estimatedValue')} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Purchase year</label>
            <input type="number" {...register('purchaseYear')} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">City</label>
            <input {...register('city', { required: 'City is required' })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
            {errors.city && <p className="text-xs text-thread mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">State</label>
            <input {...register('state')} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-pine text-paper font-semibold py-3.5 rounded-full hover:bg-pine-700 disabled:opacity-60">
          {submitting ? 'Publishing…' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreateListing;
