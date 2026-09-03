import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Repeat, CheckCircle2, XCircle, Leaf, ArrowRight } from 'lucide-react';
import * as userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-moss-100 p-5">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${color}`}>
      <Icon size={16} />
    </div>
    <div className="font-display text-2xl text-ink">{value}</div>
    <p className="text-xs text-ink/50 mt-0.5">{label}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getDashboard()
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;
  if (!data) return null;

  const { stats, sustainability, recentActivity } = data;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-1">Welcome back, {user.name.split(' ')[0]}</h1>
      <p className="text-ink/50 mb-8">Here&rsquo;s what&rsquo;s happening with your swaps.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <StatCard icon={Package} label="My Listings" value={stats.myListings} color="bg-moss-100 text-moss-600" />
        <StatCard icon={Clock} label="Pending Requests" value={stats.pendingRequests} color="bg-clay/15 text-clay-700" />
        <StatCard icon={Repeat} label="Active Swaps" value={stats.activeSwaps} color="bg-blue-100 text-blue-700" />
        <StatCard icon={CheckCircle2} label="Completed Swaps" value={stats.completedSwaps} color="bg-pine/10 text-pine" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejectedRequests} color="bg-red-100 text-thread" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-moss-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-ink">Recent activity</h2>
            <Link to="/swaps" className="text-sm text-pine hover:underline flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-ink/40">No swap activity yet. Browse listings to send your first request.</p>
          ) : (
            <div className="divide-y divide-moss-100">
              {recentActivity.map((swap) => (
                <Link to={`/swaps/${swap._id}`} key={swap._id} className="flex items-center justify-between py-3.5 hover:bg-moss-50 -mx-2 px-2 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-ink">{swap.requestedItem?.title} ↔ {swap.offeredItem?.title}</p>
                    <p className="text-xs text-ink/40 mt-0.5">with {swap.requester?.name === user.name ? swap.receiver?.name : swap.requester?.name}</p>
                  </div>
                  <StatusBadge status={swap.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-pine text-paper rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Leaf size={20} className="text-clay" />
            <h2 className="font-display text-xl">Your impact</h2>
          </div>
          <div className="font-display text-4xl mb-1">{sustainability.itemsSwapped}</div>
          <p className="text-sm text-paper/60 mb-4">items reused through swapping</p>
          <div className="stitch-divider text-clay/40 mb-4" />
          <div className="font-display text-3xl mb-1">{sustainability.estimatedTextileWasteAvoidedKg} kg</div>
          <p className="text-sm text-paper/60">estimated textile waste avoided</p>
          <p className="text-xs text-paper/40 mt-4 italic">This is an estimate based on average garment weight, not an exact measurement.</p>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <Link to="/listings/create" className="bg-clay text-pine font-semibold px-6 py-3 rounded-full hover:bg-clay-600">List a new item</Link>
        <Link to="/listings" className="border border-moss-100 px-6 py-3 rounded-full hover:border-pine">Browse listings</Link>
      </div>
    </div>
  );
};

export default Dashboard;
