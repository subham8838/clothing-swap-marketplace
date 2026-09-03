import React, { useEffect, useState } from 'react';
import { Users, Package, Repeat, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import * as adminService from '../../services/adminService';
import Loader from '../../components/Loader';
import AdminNav from '../../components/AdminNav';

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-moss-100 p-5">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${color}`}><Icon size={16} /></div>
    <div className="font-display text-2xl text-ink">{value}</div>
    <p className="text-xs text-ink/50 mt-0.5">{label}</p>
  </div>
);

const MiniBar = ({ data, labelKey = 'count' }) => {
  const max = Math.max(...data.map((d) => d[labelKey]), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-moss-100 rounded-t" style={{ height: `${(d[labelKey] / max) * 100}%`, minHeight: 4 }} />
          <span className="text-[9px] text-ink/40">{d._id.m}/{String(d._id.y).slice(2)}</span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAdminDashboard().then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;
  if (!data) return null;

  const { stats, charts, popularCategories, activeLocations } = data;

  return (
    <div>
    <AdminNav />
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Admin dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <Stat icon={Users} label="Total Users" value={stats.totalUsers} color="bg-moss-100 text-moss-600" />
        <Stat icon={Users} label="Active Users" value={stats.activeUsers} color="bg-moss-100 text-moss-600" />
        <Stat icon={Package} label="Total Listings" value={stats.totalListings} color="bg-blue-100 text-blue-700" />
        <Stat icon={Package} label="Active Listings" value={stats.activeListings} color="bg-blue-100 text-blue-700" />
        <Stat icon={Repeat} label="Swap Requests" value={stats.totalSwapRequests} color="bg-clay/15 text-clay-700" />
        <Stat icon={CheckCircle2} label="Successful Swaps" value={stats.successfulSwaps} color="bg-pine/10 text-pine" />
        <Stat icon={TrendingUp} label="Conversion Rate" value={`${stats.swapConversionRate}%`} color="bg-pine/10 text-pine" />
        <Stat icon={AlertTriangle} label="Pending Reports" value={stats.pendingReports} color="bg-red-100 text-thread" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border border-moss-100 rounded-xl p-5">
          <h3 className="font-display text-lg text-ink mb-3">User growth (6 mo)</h3>
          {charts.userGrowth.length ? <MiniBar data={charts.userGrowth} /> : <p className="text-sm text-ink/40">No data yet.</p>}
        </div>
        <div className="bg-white border border-moss-100 rounded-xl p-5">
          <h3 className="font-display text-lg text-ink mb-3">Listings created (6 mo)</h3>
          {charts.listingGrowth.length ? <MiniBar data={charts.listingGrowth} /> : <p className="text-sm text-ink/40">No data yet.</p>}
        </div>
        <div className="bg-white border border-moss-100 rounded-xl p-5">
          <h3 className="font-display text-lg text-ink mb-3">Swap requests (6 mo)</h3>
          {charts.swapGrowth.length ? <MiniBar data={charts.swapGrowth} /> : <p className="text-sm text-ink/40">No data yet.</p>}
        </div>
        <div className="bg-white border border-moss-100 rounded-xl p-5">
          <h3 className="font-display text-lg text-ink mb-3">Completed swaps (6 mo)</h3>
          {charts.completedGrowth.length ? <MiniBar data={charts.completedGrowth} /> : <p className="text-sm text-ink/40">No data yet.</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-moss-100 rounded-xl p-5">
          <h3 className="font-display text-lg text-ink mb-3">Popular categories</h3>
          <div className="space-y-2">
            {popularCategories.map((c) => (
              <div key={c._id} className="flex justify-between text-sm"><span>{c._id}</span><span className="font-mono text-ink/50">{c.count}</span></div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-moss-100 rounded-xl p-5">
          <h3 className="font-display text-lg text-ink mb-3">Active locations</h3>
          <div className="space-y-2">
            {activeLocations.map((c) => (
              <div key={c._id} className="flex justify-between text-sm"><span>{c._id}</span><span className="font-mono text-ink/50">{c.count}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
