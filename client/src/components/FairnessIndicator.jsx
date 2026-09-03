import React from 'react';

const FAIRNESS_STYLES = {
  'Excellent Match': 'text-moss-600',
  'Good Match': 'text-clay-700',
  'Moderate Match': 'text-thread',
  'Large Value Difference': 'text-red-600',
};

const FairnessIndicator = ({ offeredValue, requestedValue, fairness, difference }) => (
  <div className="rounded-lg border border-moss-100 bg-white p-4 font-mono text-sm">
    <div className="flex justify-between text-ink/70">
      <span>Offered value</span>
      <span>₹{offeredValue?.toLocaleString('en-IN')}</span>
    </div>
    <div className="flex justify-between text-ink/70 mt-1">
      <span>Requested value</span>
      <span>₹{requestedValue?.toLocaleString('en-IN')}</span>
    </div>
    <div className="stitch-divider my-3" />
    <div className="flex justify-between font-semibold text-ink">
      <span>Difference</span>
      <span>₹{difference?.toLocaleString('en-IN')}</span>
    </div>
    <div className={`mt-2 text-xs font-body font-semibold uppercase tracking-wide ${FAIRNESS_STYLES[fairness] || ''}`}>
      {fairness}
    </div>
    <p className="mt-2 text-xs text-ink/40 font-body italic">Estimated value, not a guaranteed market price.</p>
  </div>
);

export default FairnessIndicator;
