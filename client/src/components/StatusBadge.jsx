import React from 'react';

const STYLES = {
  PENDING: 'bg-clay/15 text-clay-700',
  NEGOTIATING: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-moss-100 text-moss-600',
  REJECTED: 'bg-red-100 text-thread',
  CANCELLED: 'bg-ink/10 text-ink/60',
  COMPLETED: 'bg-pine/10 text-pine',
  EXPIRED: 'bg-ink/10 text-ink/50',
  AVAILABLE: 'bg-moss-100 text-moss-600',
  PENDING_SWAP: 'bg-clay/15 text-clay-700',
  SWAPPED: 'bg-pine/10 text-pine',
  REMOVED: 'bg-red-100 text-thread',
  OPEN: 'bg-clay/15 text-clay-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-moss-100 text-moss-600',
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STYLES[status] || 'bg-ink/10 text-ink/70'}`}>{status?.replace('_', ' ')}</span>
);

export default StatusBadge;
