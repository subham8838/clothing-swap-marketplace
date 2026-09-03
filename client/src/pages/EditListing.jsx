import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadCloud, X, Trash2 } from 'lucide-react';
import * as clothingService from '../services/clothingService';
import { getErrorMessage } from '../services/api';
import Loader from '../components/Loader';

const CATEGORIES = ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Hoodies', 'Sweaters', 'Dresses', 'Skirts', 'Shorts', 'Ethnic Wear', 'Sportswear', 'Formal Wear', 'Shoes', 'Accessories'];
const CONDITIONS = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    clothingService.getClothingById(id).then(({ data }) => {
      const item = data.item;
      reset({
        title: item.title, description: item.description, category: item.category,
        condition: item.condition, brand: item.brand, size: item.size, color: item.color,
        estimatedValue: item.estimatedValue, purchaseYear: item.purchaseYear,
        city: item.location.city, state: item.location.state,
      });
      setExistingImages(item.images);
    }).finally(() => setLoading(false));
  }, [id, reset]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))].slice(0, 6));
  };

  const onSubmit = async (values) => {
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
      // Only send new files if the user chose to replace images; otherwise the backend keeps existing ones.
      newImages.forEach((img) => formData.append('images', img.file));

      await clothingService.updateClothing(id, formData);
      navigate(`/listings/${id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove this listing? This cannot be undone.')) return;
    await clothingService.deleteClothing(id);
    navigate('/dashboard');
  };

  if (loading) return <Loader full />;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-3xl text-ink">Edit listing</h1>
        <button onClick={handleDelete} className="flex items-center gap-1 text-sm text-thread hover:underline">
          <Trash2 size={14} /> Delete listing
        </button>
      </div>
      <p className="text-ink/50 mb-8">Update the details of your listing.</p>

      {error && <div className="mb-6 text-sm bg-red-50 text-thread border border-red-100 rounded-lg px-4 py-3">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-2">Current photos</label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {existingImages.map((img) => (
              <div key={img.publicId} className="aspect-square rounded-lg overflow-hidden border border-moss-100">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <label className="block text-sm font-medium text-ink/70 mb-2">Replace photos (optional — uploads all 6 max, replaces the full set)</label>
          <div className="grid grid-cols-4 gap-3">
            {newImages.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-moss-100">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-ink/60 text-paper rounded-full p-0.5">
                  <X size={14} />
                </button>
              </div>
            ))}
            {newImages.length < 6 && (
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
          <input {...register('title', { required: 'Title is required' })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          {errors.title && <p className="text-xs text-thread mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1.5">Description</label>
          <textarea {...register('description', { required: 'Description is required' })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5 h-28 resize-none" />
          {errors.description && <p className="text-xs text-thread mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Category</label>
            <select {...register('category', { required: true })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Condition</label>
            <select {...register('condition', { required: true })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5">
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Brand</label>
            <input {...register('brand', { required: true })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Size</label>
            <input {...register('size', { required: true })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Colour</label>
            <input {...register('color')} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Estimated value (₹)</label>
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
            <input {...register('city', { required: true })} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">State</label>
            <input {...register('state')} className="w-full border border-moss-100 rounded-lg px-4 py-2.5" />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-pine text-paper font-semibold py-3.5 rounded-full hover:bg-pine-700 disabled:opacity-60">
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditListing;
