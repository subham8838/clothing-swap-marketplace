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

// Lets either participant propose a revised set of items for the swap (negotiation).
const ProposalModal = ({ swap, onClose, onCreated }) => {
  const { user } = useAuth();
  const isRequester = String(swap.requester._id) === String(user._id);
  const myExistingItem = isRequester ? swap.offeredItem : swap.requestedItem;
  const theirExistingItem = isRequester ? swap.requestedItem : swap.offeredItem;

  const [myItems, setMyItems] = useState([]);
  const [selectedMine, setSelectedMine] = useState([myExistingItem._id]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    clothingService.getClothingList({ owner: user._id, limit: 50 }).then(({ data }) => {
      const mine = data.items.filter((i) => (i.status === 'AVAILABLE' || i._id === myExistingItem._id));
      setMyItems(mine);
    });
  }, [user._id, myExistingItem._id]);

  const toggleItem = (id) => {
    setSelectedMine((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const myTotal = myItems.filter((i) => selectedMine.includes(i._id)).reduce((s, i) => s + i.estimatedValue, 0);
  const theirTotal = theirExistingItem.estimatedValue;

  const handleSubmit = async () => {
    if (selectedMine.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = isRequester
        ? { offeredItems: selectedMine, requestedItems: [theirExistingItem._id], message }
        : { requestedItems: selectedMine, offeredItems: [theirExistingItem._id], message };
      const { data } = await swapService.createProposal(swap._id, payload);
      onCreated(data.swap);
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
        <h3 className="font-display text-2xl text-ink mb-1">Revise the proposal</h3>
        <p className="text-ink/50 text-sm mb-6">Select which of your items you&rsquo;d like to offer instead.</p>

        <div className="grid grid-cols-3 gap-2 mb-4 max-h-52 overflow-y-auto">
          {myItems.map((mi) => (
            <button key={mi._id} onClick={() => toggleItem(mi._id)}
              className={`border-2 rounded-lg p-1.5 text-left ${selectedMine.includes(mi._id) ? 'border-pine' : 'border-moss-100'}`}>
              <div className="aspect-square rounded overflow-hidden bg-moss-50 mb-1">
                <img src={mi.primaryImage || mi.images?.[0]?.url} alt={mi.title} className="w-full h-full object-cover" />
              </div>
              <p className="text-[11px] font-medium line-clamp-1">{mi.title}</p>
              <p className="text-[10px] font-mono text-pine">₹{mi.estimatedValue}</p>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <FairnessIndicator offeredValue={myTotal} requestedValue={theirTotal} {...calcFairness(myTotal, theirTotal)} />
        </div>

        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explain your revised offer…"
          className="w-full border border-moss-100 rounded-lg px-3 py-2 text-sm mb-4 h-20 resize-none focus:border-pine outline-none" />

        {error && <p className="text-xs text-thread mb-3">{error}</p>}

        <button onClick={handleSubmit} disabled={selectedMine.length === 0 || submitting}
          className="w-full bg-pine text-paper font-semibold py-3 rounded-full disabled:opacity-50">
          {submitting ? 'Sending…' : 'Send Revised Proposal'}
        </button>
      </div>
    </div>
  );
};

export default ProposalModal;
