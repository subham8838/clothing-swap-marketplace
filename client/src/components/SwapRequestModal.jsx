import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import * as clothingService from '../services/clothingService';
import * as swapService from '../services/swapService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import FairnessIndicator from './FairnessIndicator';

const calcFairness = (offered, requested) => {
  const diff = Math.abs(offered - requested);
  const base = Math.max(offered, requested, 1);
  const pct = (diff / base) * 100;
  let fairness;
  if (pct < 10) fairness = 'Excellent Match';
  else if (pct < 20) fairness = 'Good Match';
  else if (pct < 35) fairness = 'Moderate Match';
  else fairness = 'Large Value Difference';
  return { difference: diff, fairness };
};

const SwapRequestModal = ({ item, onClose }) => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    clothingService.getClothingList({ owner: user._id, limit: 50 })
      .then(({ data }) => {
        // client-side filter: only this user's own available items, excluding the requested one
        const mine = data.items.filter((i) => String(i.owner._id || i.owner) === String(user._id) && i._id !== item._id && i.status === 'AVAILABLE');
        setMyItems(mine);
      })
      .finally(() => setLoading(false));
  }, [user._id, item._id]);

  const selectedItem = myItems.find((i) => i._id === selectedId);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setError('');
    try {
      await swapService.createSwapRequest({ requestedItem: item._id, offeredItem: selectedId, message });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-ink/40 hover:text-ink"><X size={20} /></button>

        {success ? (
          <div className="text-center py-8">
            <h3 className="font-display text-2xl text-ink mb-2">Swap request sent!</h3>
            <p className="text-ink/50 mb-6">You&rsquo;ll be notified as soon as they respond.</p>
            <button onClick={onClose} className="bg-pine text-paper px-6 py-2.5 rounded-full">Done</button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-2xl text-ink mb-1">Propose a swap</h3>
            <p className="text-ink/50 text-sm mb-6">Requesting: <span className="font-medium text-ink">{item.title}</span></p>

            {loading ? (
              <p className="text-sm text-ink/40">Loading your listings…</p>
            ) : myItems.length === 0 ? (
              <p className="text-sm text-ink/50">You don&rsquo;t have any available listings to offer yet. List an item first.</p>
            ) : (
              <>
                <label className="block text-sm font-medium text-ink/70 mb-2">Choose one of your items to offer</label>
                <div className="grid grid-cols-3 gap-2 mb-4 max-h-52 overflow-y-auto">
                  {myItems.map((mi) => (
                    <button key={mi._id} onClick={() => setSelectedId(mi._id)}
                      className={`border-2 rounded-lg p-1.5 text-left ${selectedId === mi._id ? 'border-pine' : 'border-moss-100'}`}>
                      <div className="aspect-square rounded overflow-hidden bg-moss-50 mb-1">
                        <img src={mi.primaryImage || mi.images?.[0]?.url} alt={mi.title} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] font-medium line-clamp-1">{mi.title}</p>
                      <p className="text-[10px] font-mono text-pine">₹{mi.estimatedValue}</p>
                    </button>
                  ))}
                </div>

                {selectedItem && (
                  <div className="mb-4">
                    <FairnessIndicator
                      offeredValue={selectedItem.estimatedValue}
                      requestedValue={item.estimatedValue}
                      {...calcFairness(selectedItem.estimatedValue, item.estimatedValue)}
                    />
                  </div>
                )}

                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add an optional message…"
                  className="w-full border border-moss-100 rounded-lg px-3 py-2 text-sm mb-4 h-20 resize-none focus:border-pine outline-none" />

                {error && <p className="text-xs text-thread mb-3">{error}</p>}

                <button onClick={handleSubmit} disabled={!selectedId || submitting}
                  className="w-full bg-pine text-paper font-semibold py-3 rounded-full disabled:opacity-50">
                  {submitting ? 'Sending…' : 'Send Swap Request'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SwapRequestModal;
