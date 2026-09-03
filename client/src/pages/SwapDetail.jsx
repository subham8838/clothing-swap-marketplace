import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Ban, Star } from 'lucide-react';
import * as swapService from '../services/swapService';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import FairnessIndicator from '../components/FairnessIndicator';
import ChatPanel from '../components/ChatPanel';
import ProposalModal from '../components/ProposalModal';
import Loader from '../components/Loader';

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

const ItemThumb = ({ item, label }) => (
  <div className="flex items-center gap-3">
    <img src={item?.images?.[0]?.url} alt={item?.title} className="w-16 h-16 rounded-lg object-cover border border-moss-100" />
    <div>
      <p className="text-[10px] uppercase tracking-wide text-ink/40">{label}</p>
      <p className="text-sm font-medium text-ink line-clamp-1">{item?.title}</p>
      <p className="text-xs font-mono text-pine">₹{item?.estimatedValue?.toLocaleString('en-IN')}</p>
    </div>
  </div>
);

const ReviewForm = ({ swapId, onDone }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await swapService.createReview(swapId, { rating, comment });
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-moss-50 border border-moss-100 rounded-xl p-5 mt-6">
      <h3 className="font-display text-lg text-ink mb-3">Leave a review</h3>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)}>
            <Star size={22} className={n <= rating ? 'fill-clay text-clay' : 'text-moss-100'} />
          </button>
        ))}
      </div>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How was the swap?"
        className="w-full border border-moss-100 rounded-lg px-3 py-2 text-sm h-20 resize-none mb-3" />
      {error && <p className="text-xs text-thread mb-2">{error}</p>}
      <button onClick={submit} disabled={submitting} className="bg-pine text-paper text-sm font-semibold px-5 py-2 rounded-full disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
};

const SwapDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [swap, setSwap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [showProposal, setShowProposal] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  const load = () => {
    swapService.getSwapById(id)
      .then(({ data }) => setSwap(data.swap))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <Loader full />;
  if (error || !swap) return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-ink/50">{error || 'Swap not found.'}</div>;

  const isReceiver = String(swap.receiver._id) === String(user._id);
  const otherUser = isReceiver ? swap.requester : swap.receiver;

  const runAction = async (fn) => {
    setActionError('');
    try {
      const { data } = await fn(id);
      setSwap(data.swap);
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  const latestProposal = swap.proposals?.length ? swap.proposals[swap.proposals.length - 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink">Swap with {otherUser.name}</h1>
          <p className="text-ink/50 text-sm mt-1">Started {new Date(swap.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
        <StatusBadge status={swap.status} />
      </div>

      {actionError && <div className="mb-6 text-sm bg-red-50 text-thread border border-red-100 rounded-lg px-4 py-3">{actionError}</div>}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-moss-100 rounded-xl p-5 flex justify-between">
          <ItemThumb item={swap.offeredItem} label="Offered" />
          <ItemThumb item={swap.requestedItem} label="Requested" />
        </div>
        <FairnessIndicator
          offeredValue={swap.offeredItem.estimatedValue}
          requestedValue={swap.requestedItem.estimatedValue}
          {...calcFairness(swap.offeredItem.estimatedValue, swap.requestedItem.estimatedValue)}
        />
      </div>

      {latestProposal && (
        <div className="bg-clay/10 border border-clay/30 rounded-xl p-4 mb-6">
          <p className="text-xs uppercase tracking-wide text-clay-700 font-semibold mb-1">Latest proposal</p>
          <p className="text-sm text-ink/70">{latestProposal.message || 'A revised set of items was proposed.'}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        {isReceiver && ['PENDING', 'NEGOTIATING'].includes(swap.status) && (
          <>
            <button onClick={() => runAction(swapService.acceptSwap)} className="flex items-center gap-2 bg-pine text-paper px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-pine-700">
              <CheckCircle2 size={16} /> Accept Swap
            </button>
            <button onClick={() => runAction(swapService.rejectSwap)} className="flex items-center gap-2 border border-thread text-thread px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-50">
              <XCircle size={16} /> Reject
            </button>
          </>
        )}
        {['PENDING', 'NEGOTIATING'].includes(swap.status) && (
          <button onClick={() => setShowProposal(true)} className="border border-moss-100 px-5 py-2.5 rounded-full text-sm font-semibold hover:border-pine">
            Propose Revised Swap
          </button>
        )}
        {['PENDING', 'NEGOTIATING', 'ACCEPTED'].includes(swap.status) && (
          <button onClick={() => runAction(swapService.cancelSwap)} className="flex items-center gap-2 text-ink/50 px-5 py-2.5 rounded-full text-sm hover:text-thread">
            <Ban size={16} /> Cancel
          </button>
        )}
        {swap.status === 'ACCEPTED' && (
          <button onClick={() => runAction(swapService.completeSwap)} className="flex items-center gap-2 bg-clay text-pine px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-clay-600">
            <CheckCircle2 size={16} /> Mark Completed
          </button>
        )}
      </div>

      <h2 className="font-display text-xl text-ink mb-3">Negotiate</h2>
      <ChatPanel swapId={id} />

      {swap.status === 'COMPLETED' && !reviewed && (
        <ReviewForm swapId={id} onDone={() => setReviewed(true)} />
      )}
      {swap.status === 'COMPLETED' && reviewed && (
        <p className="text-sm text-moss-600 mt-6">Thanks for your review!</p>
      )}

      {showProposal && (
        <ProposalModal swap={swap} onClose={() => setShowProposal(false)} onCreated={(updated) => { setSwap(updated); setShowProposal(false); load(); }} />
      )}
    </div>
  );
};

export default SwapDetail;
