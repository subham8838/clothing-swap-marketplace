import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Repeat } from 'lucide-react';
import * as userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    userService.getUserProfile(id).then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader full />;
  if (!data) return <div className="text-center py-24 text-ink/50">User not found.</div>;

  const { user, listingsCount, reviews } = data;
  const isMe = currentUser && currentUser._id === user._id;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-moss-100 flex items-center justify-center font-display text-3xl text-pine overflow-hidden">
          {user.profileImage?.url ? <img src={user.profileImage.url} alt="" className="w-full h-full object-cover" /> : user.name[0]}
        </div>
        <div>
          <h1 className="font-display text-2xl text-ink">{user.name}{isMe && ' (You)'}</h1>
          <p className="text-sm text-ink/50 flex items-center gap-1 mt-1"><MapPin size={13} /> {user.location?.city}, {user.location?.state}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-ink/60">
            <span className="flex items-center gap-1"><Star size={14} className="fill-clay text-clay" /> {user.rating || 'New'} ({user.ratingCount} reviews)</span>
            <span className="flex items-center gap-1"><Repeat size={14} /> {user.completedSwaps} swaps</span>
          </div>
        </div>
      </div>

      {user.bio && <p className="text-ink/70 mb-8 leading-relaxed">{user.bio}</p>}

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-moss-50 rounded-xl p-4 text-center">
          <div className="font-display text-2xl text-pine">{listingsCount}</div>
          <p className="text-xs text-ink/50 mt-1">Listings</p>
        </div>
        <div className="bg-moss-50 rounded-xl p-4 text-center">
          <div className="font-display text-2xl text-pine">{user.completedSwaps}</div>
          <p className="text-xs text-ink/50 mt-1">Completed swaps</p>
        </div>
        <div className="bg-moss-50 rounded-xl p-4 text-center">
          <div className="font-display text-2xl text-pine">{new Date(user.createdAt).getFullYear()}</div>
          <p className="text-xs text-ink/50 mt-1">Member since</p>
        </div>
      </div>

      <h2 className="font-display text-xl text-ink mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-ink/40">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border border-moss-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{r.reviewer.name}</span>
                <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={12} className="fill-clay text-clay" />)}</div>
              </div>
              <p className="text-sm text-ink/60">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
