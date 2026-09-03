import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Star, Flag, Heart, MessageCircle } from 'lucide-react';
import * as clothingService from '../services/clothingService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ClothingCard from '../components/ClothingCard';
import Loader from '../components/Loader';
import SwapRequestModal from '../components/SwapRequestModal';
import ReportModal from '../components/ReportModal';

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    clothingService.getClothingById(id)
      .then(({ data }) => { setItem(data.item); setRelated(data.related); })
      .catch(() => setError('This clothing item is no longer available.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader full />;
  if (error || !item) return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-ink/50">{error || 'Item not found.'}</div>;

  const isOwner = user && String(item.owner._id) === String(user._id);

  const handleRequestSwap = () => {
    if (!user) return navigate('/login');
    setShowSwapModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-moss-50 border border-moss-100">
            <img src={item.images[activeImg]?.url} alt={item.title} className="w-full h-full object-cover" />
          </div>
          {item.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {item.images.map((img, idx) => (
                <button key={img.publicId} onClick={() => setActiveImg(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${idx === activeImg ? 'border-pine' : 'border-transparent'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <StatusBadge status={item.status} />
            <span className="flex items-center gap-1 text-sm text-ink/40"><MapPin size={14} /> {item.location.city}, {item.location.state}</span>
          </div>
          <h1 className="font-display text-3xl text-ink mb-2">{item.title}</h1>
          <p className="font-mono text-2xl text-pine font-semibold mb-4">₹{item.estimatedValue.toLocaleString('en-IN')}</p>
          <p className="text-ink/60 leading-relaxed mb-6">{item.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6 border-y border-moss-100 py-5">
            <div><span className="text-ink/40">Brand</span><p className="font-medium">{item.brand}</p></div>
            <div><span className="text-ink/40">Category</span><p className="font-medium">{item.category}</p></div>
            <div><span className="text-ink/40">Size</span><p className="font-medium">{item.size}</p></div>
            <div><span className="text-ink/40">Condition</span><p className="font-medium">{item.condition}</p></div>
            {item.color && <div><span className="text-ink/40">Colour</span><p className="font-medium">{item.color}</p></div>}
            {item.material && <div><span className="text-ink/40">Material</span><p className="font-medium">{item.material}</p></div>}
          </div>

          <Link to={`/profile/${item.owner._id}`} className="flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 rounded-full bg-moss-100 flex items-center justify-center text-pine font-display">
              {item.owner.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-ink group-hover:text-pine">{item.owner.name}</p>
              <p className="text-xs text-ink/40 flex items-center gap-1"><Star size={12} className="fill-clay text-clay" /> {item.owner.rating || 'New'} · {item.owner.completedSwaps} swaps</p>
            </div>
          </Link>

          {!isOwner && item.status === 'AVAILABLE' && (
            <div className="flex gap-3">
              <button onClick={handleRequestSwap} className="flex-1 bg-pine text-paper font-semibold py-3.5 rounded-full hover:bg-pine-700 transition-colors">
                Request Swap
              </button>
              <button className="border border-moss-100 rounded-full p-3.5 hover:border-pine"><Heart size={18} /></button>
              <button onClick={() => setShowReportModal(true)} className="border border-moss-100 rounded-full p-3.5 hover:border-thread"><Flag size={18} /></button>
            </div>
          )}
          {isOwner && <p className="text-sm text-ink/40 italic">This is your listing.</p>}
          {!isOwner && item.status !== 'AVAILABLE' && <p className="text-sm text-ink/40 italic">This item is no longer available for swap.</p>}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl text-ink mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((r) => <ClothingCard key={r._id} item={r} />)}
          </div>
        </div>
      )}

      {showSwapModal && (
        <SwapRequestModal item={item} onClose={() => setShowSwapModal(false)} />
      )}
      {showReportModal && (
        <ReportModal listingId={item._id} onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
};

export default ItemDetail;
