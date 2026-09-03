import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as swapService from '../services/swapService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'NEGOTIATING', label: 'Negotiating' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const SwapList = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    swapService.getMySwaps(params)
      .then(({ data }) => setSwaps(data.swaps))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-1">My swaps</h1>
      <p className="text-ink/50 mb-8">Track requests you&rsquo;ve sent and received.</p>

      <div className="flex gap-2 mb-8 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setStatus(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm border ${status === f.value ? 'bg-pine text-paper border-pine' : 'border-moss-100 text-ink/60 hover:border-pine'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : swaps.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink/50">You don&rsquo;t have any swap requests here yet.</p>
          <Link to="/listings" className="text-pine font-medium hover:underline mt-2 inline-block">Browse listings to get started</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {swaps.map((swap) => {
            const isRequester = String(swap.requester._id) === String(user._id);
            const other = isRequester ? swap.receiver : swap.requester;
            return (
              <Link to={`/swaps/${swap._id}`} key={swap._id} className="flex items-center gap-4 bg-white border border-moss-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex -space-x-3">
                  <img src={swap.offeredItem?.images?.[0]?.url} alt="" className="w-14 h-14 rounded-lg object-cover border-2 border-white" />
                  <img src={swap.requestedItem?.images?.[0]?.url} alt="" className="w-14 h-14 rounded-lg object-cover border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {isRequester ? 'You offered' : 'They offered'} {swap.offeredItem?.title} for {swap.requestedItem?.title}
                  </p>
                  <p className="text-xs text-ink/40 mt-0.5">with {other?.name} · {new Date(swap.updatedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <StatusBadge status={swap.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SwapList;
