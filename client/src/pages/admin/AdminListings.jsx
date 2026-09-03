import React, { useEffect, useState } from 'react';
import { Search, Trash2, RotateCcw } from 'lucide-react';
import * as adminService from '../../services/adminService';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import AdminNav from '../../components/AdminNav';

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    adminService.getAdminListings(params).then(({ data }) => setListings(data.listings)).finally(() => setLoading(false));
  };

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search, status]);

  const handleRemove = async (id) => { await adminService.removeListing(id); load(); };
  const handleRestore = async (id) => { await adminService.restoreListing(id); load(); };

  return (
    <div>
    <AdminNav />
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Manage listings</h1>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title"
            className="pl-9 pr-4 py-2.5 border border-moss-100 rounded-full text-sm w-full focus:border-pine outline-none" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-moss-100 rounded-lg px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="PENDING_SWAP">Pending swap</option>
          <option value="SWAPPED">Swapped</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white border border-moss-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-moss-50 text-ink/50 text-xs uppercase">
              <tr><th className="text-left p-3">Title</th><th className="text-left p-3">Owner</th><th className="text-left p-3">Value</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-moss-100">
              {listings.map((l) => (
                <tr key={l._id}>
                  <td className="p-3 font-medium">{l.title}</td>
                  <td className="p-3 text-ink/60">{l.owner?.name}</td>
                  <td className="p-3 font-mono text-ink/60">₹{l.estimatedValue}</td>
                  <td className="p-3"><StatusBadge status={l.status} /></td>
                  <td className="p-3 text-right">
                    {l.status === 'REMOVED' ? (
                      <button onClick={() => handleRestore(l._id)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-moss-100 text-moss-600">
                        <RotateCcw size={12} /> Restore
                      </button>
                    ) : (
                      <button onClick={() => handleRemove(l._id)} className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-thread">
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 && <p className="text-center text-ink/40 py-10">No listings found.</p>}
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminListings;
