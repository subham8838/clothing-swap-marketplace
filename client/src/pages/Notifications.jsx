import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const typeLink = (n) => {
  if (['NEW_SWAP_REQUEST', 'SWAP_ACCEPTED', 'SWAP_REJECTED', 'NEW_MESSAGE', 'NEW_PROPOSAL', 'PROPOSAL_ACCEPTED', 'SWAP_COMPLETED'].includes(n.type)) {
    return `/swaps/${n.referenceId}`;
  }
  return '/dashboard';
};

const Notifications = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-ink">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-pine hover:underline flex items-center gap-1">
            <CheckCheck size={14} /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-ink/40">
          <Bell size={32} className="mx-auto mb-3" />
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link key={n._id} to={typeLink(n)} onClick={() => !n.isRead && markRead(n._id)}
              className={`block rounded-xl border p-4 ${n.isRead ? 'border-moss-100 bg-white' : 'border-clay/30 bg-clay/5'}`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-ink">{n.title}</p>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-clay mt-1.5 flex-shrink-0" />}
              </div>
              <p className="text-sm text-ink/60 mt-0.5">{n.message}</p>
              <p className="text-xs text-ink/30 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
