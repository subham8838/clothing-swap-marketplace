import React, { useEffect, useState } from 'react';
import * as adminService from '../../services/adminService';
import StatusBadge from '../../components/StatusBadge';
import Loader from '../../components/Loader';
import AdminNav from '../../components/AdminNav';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});

  const load = () => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    adminService.getAdminReports(params).then(({ data }) => setReports(data.reports)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status]);

  const resolve = async (id, newStatus) => {
    await adminService.resolveReport(id, { status: newStatus, adminResponse: responses[id] || '' });
    load();
  };

  return (
    <div>
    <AdminNav />
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-8">Reports &amp; disputes</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm border ${status === s ? 'bg-pine text-paper border-pine' : 'border-moss-100 text-ink/60 hover:border-pine'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : reports.length === 0 ? (
        <p className="text-center text-ink/40 py-16">No reports found.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r._id} className="bg-white border border-moss-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{r.reason}</p>
                  <p className="text-xs text-ink/40 mt-0.5">
                    Reported by {r.reportedBy?.name} {r.reportedUser && `· against ${r.reportedUser.name}`} {r.listing && `· listing "${r.listing.title}"`}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.description && <p className="text-sm text-ink/60 mb-3">{r.description}</p>}
              {r.adminResponse && <p className="text-sm text-pine bg-moss-50 rounded-lg px-3 py-2 mb-3">Admin note: {r.adminResponse}</p>}

              {['OPEN', 'UNDER_REVIEW'].includes(r.status) && (
                <div className="flex flex-col sm:flex-row gap-2 mt-3">
                  <input placeholder="Admin response (optional)" value={responses[r._id] || ''}
                    onChange={(e) => setResponses((prev) => ({ ...prev, [r._id]: e.target.value }))}
                    className="flex-1 border border-moss-100 rounded-lg px-3 py-2 text-sm" />
                  <div className="flex gap-2">
                    {r.status === 'OPEN' && (
                      <button onClick={() => resolve(r._id, 'UNDER_REVIEW')} className="text-xs font-semibold px-3 py-2 rounded-full bg-blue-100 text-blue-700">Review</button>
                    )}
                    <button onClick={() => resolve(r._id, 'RESOLVED')} className="text-xs font-semibold px-3 py-2 rounded-full bg-moss-100 text-moss-600">Resolve</button>
                    <button onClick={() => resolve(r._id, 'REJECTED')} className="text-xs font-semibold px-3 py-2 rounded-full bg-red-50 text-thread">Reject</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminReports;
