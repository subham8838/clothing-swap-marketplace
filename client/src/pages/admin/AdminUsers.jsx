import React, { useEffect, useState } from 'react';
import { Search, Ban, CheckCircle2 } from 'lucide-react';
import * as adminService from '../../services/adminService';
import Loader from '../../components/Loader';
import AdminNav from '../../components/AdminNav';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    adminService.getAdminUsers(params).then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [search, status]);

  const toggleSuspend = async (user) => {
    if (user.isSuspended) await adminService.activateUser(user._id);
    else await adminService.suspendUser(user._id);
    load();
  };

  return (
    <div>
    <AdminNav />
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Manage users</h1>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email"
            className="pl-9 pr-4 py-2.5 border border-moss-100 rounded-full text-sm w-full focus:border-pine outline-none" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-moss-100 rounded-lg px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white border border-moss-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-moss-50 text-ink/50 text-xs uppercase">
              <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Location</th><th className="text-left p-3">Swaps</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-moss-100">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-ink/60">{u.email}</td>
                  <td className="p-3 text-ink/60">{u.location?.city}</td>
                  <td className="p-3 text-ink/60">{u.completedSwaps}</td>
                  <td className="p-3">
                    <span className={`badge ${u.isSuspended ? 'bg-red-100 text-thread' : 'bg-moss-100 text-moss-600'}`}>
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => toggleSuspend(u)} className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full ${u.isSuspended ? 'bg-moss-100 text-moss-600' : 'bg-red-50 text-thread'}`}>
                      {u.isSuspended ? <><CheckCircle2 size={12} /> Reactivate</> : <><Ban size={12} /> Suspend</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center text-ink/40 py-10">No users found.</p>}
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminUsers;
