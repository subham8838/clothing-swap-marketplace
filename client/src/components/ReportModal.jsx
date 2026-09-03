import React, { useState } from 'react';
import { X } from 'lucide-react';
import * as reportService from '../services/reportService';
import { getErrorMessage } from '../services/api';

const REASONS = ['Inappropriate clothing', 'Fake information', 'Spam', 'Harassment', 'Suspicious user', 'Fraudulent swap behavior'];

// Generic report modal — pass either a listingId or a reportedUserId (or both).
const ReportModal = ({ listingId, reportedUserId, onClose }) => {
  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await reportService.createReport({ listing: listingId, reportedUser: reportedUserId, reason, description });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-ink/40 hover:text-ink"><X size={20} /></button>
        {done ? (
          <div className="text-center py-6">
            <h3 className="font-display text-xl text-ink mb-2">Report submitted</h3>
            <p className="text-sm text-ink/50 mb-6">Our team will review it shortly.</p>
            <button onClick={onClose} className="bg-pine text-paper px-6 py-2.5 rounded-full">Close</button>
          </div>
        ) : (
          <>
            <h3 className="font-display text-xl text-ink mb-4">Report this {listingId ? 'listing' : 'user'}</h3>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-moss-100 rounded-lg px-3 py-2 text-sm mb-4">
              {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-moss-100 rounded-lg px-3 py-2 text-sm h-24 resize-none mb-4" />
            {error && <p className="text-xs text-thread mb-3">{error}</p>}
            <button onClick={submit} disabled={submitting} className="w-full bg-thread text-paper font-semibold py-3 rounded-full disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
