import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';

const ClothingCard = ({ item }) => {
  const image = item.primaryImage || item.images?.[0]?.url;
  return (
    <Link to={`/listings/${item._id}`} className="group block bg-white rounded-xl overflow-hidden border border-moss-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="aspect-[4/5] bg-moss-50 overflow-hidden relative">
        {image ? (
          <img src={image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-moss-500 text-sm">No image</div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={item.status} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-base text-ink leading-snug line-clamp-1">{item.title}</h3>
        <p className="text-xs text-ink/50 mt-0.5">{item.brand} · {item.size} · {item.condition}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-sm text-pine font-semibold">₹{item.estimatedValue?.toLocaleString('en-IN')}</span>
          <span className="flex items-center gap-1 text-xs text-ink/40">
            <MapPin size={12} /> {item.location?.city}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ClothingCard;
