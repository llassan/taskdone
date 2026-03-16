import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import api from '../utils/api';
import socket from '../utils/socket';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiDownload, FiPhone, FiStar, FiCheckCircle, FiExternalLink } from 'react-icons/fi';

export default function OrderDetail() {
  const { id, lang } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [interviewCompany, setInterviewCompany] = useState('');
  const [interviewRole, setInterviewRole] = useState('');

  const prefix = `/${lang || 'en'}`;

  const fetchOrder = async () => {
    try { const res = await api.get(`/orders/${id}`); setOrder(res.data); }
    catch { toast.error('Failed to load order'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  useEffect(() => {
    socket.emit('join-order', id);
    const handler = () => fetchOrder();
    socket.on('order-update', handler);
    socket.on('application-added', handler);
    return () => { socket.emit('leave-order', id); socket.off('order-update', handler); socket.off('application-added', handler); };
  }, [id]);

  useEffect(() => {
    if (!order || !['pending', 'assigned', 'in_progress'].includes(order.status)) return;
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [order?.status]);

  const handleApprove = async () => {
    try {
      await api.patch(`/orders/${id}/approve`, { rating, review });
      toast.success('Order approved!');
      fetchOrder();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleLogInterview = async () => {
    if (!interviewCompany) { toast.error('Enter the company name'); return; }
    try {
      await api.post(`/orders/${id}/interview`, { company: interviewCompany, role: interviewRole });
      toast.success('Interview logged!');
      setInterviewCompany('');
      setInterviewRole('');
      fetchOrder();
    } catch (e) { toast.error('Failed'); }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await api.post(`/orders/${id}/report`);
      toast.success('Report generated!');
      fetchOrder();
    } catch (e) { toast.error('Failed to generate report'); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">{t('common.loading')}</div>;

  const progress = order.totalApplications > 0 ? Math.round((order.completedApplications / order.totalApplications) * 100) : 0;
  const isClient = user?.role === 'client';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={isClient ? `${prefix}/dashboard` : `${prefix}/worker`} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"><FiArrowLeft /> {t('common.back')}</Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">
            {order.completedApplications} / {order.totalApplications} {t('dashboard.applicationsMade')}
          </h1>
          <span className="text-sm font-medium text-emerald-600 uppercase">{order.plan} plan</span>
        </div>
        {/* Progress bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{progress}% {t('order.complete')}</span>
          <span>{order.interviewCalls} {t('dashboard.interviewCalls')}</span>
        </div>
        {order.workerId && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
            {t('order.worker')}: <span className="font-medium">{order.workerId.name || 'Assigned'}</span>
            {order.workerId.workerProfile && (
              <span className="ml-2 text-yellow-500"><FiStar className="inline" size={12} /> {order.workerId.workerProfile.rating}</span>
            )}
          </div>
        )}
      </div>

      {/* Log Interview */}
      {isClient && ['in_progress', 'review_pending', 'completed'].includes(order.status) && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiPhone /> {t('order.logInterview')}</h2>
          <p className="text-sm text-gray-500 mb-3">{t('order.logInterviewHint')}</p>
          <div className="flex gap-3">
            <input value={interviewCompany} onChange={e => setInterviewCompany(e.target.value)} className="input-field flex-1" placeholder={t('order.companyName')} />
            <input value={interviewRole} onChange={e => setInterviewRole(e.target.value)} className="input-field flex-1" placeholder={t('order.role')} />
            <button onClick={handleLogInterview} className="btn-primary text-sm whitespace-nowrap">{t('order.logBtn')}</button>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">{t('order.applications')} ({order.applications?.length || 0})</h2>
          <button onClick={handleGenerateReport} className="text-sm text-emerald-600 font-medium hover:underline flex items-center gap-1">
            <FiDownload size={12} /> {t('order.generateReport')}
          </button>
        </div>
        {order.applications?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 font-medium text-gray-600">#</th>
                  <th className="text-left p-2 font-medium text-gray-600">{t('worker.company')}</th>
                  <th className="text-left p-2 font-medium text-gray-600">{t('worker.jobTitle')}</th>
                  <th className="text-left p-2 font-medium text-gray-600">{t('worker.portal')}</th>
                  <th className="text-left p-2 font-medium text-gray-600">{t('worker.location')}</th>
                  <th className="text-left p-2 font-medium text-gray-600">{t('common.status', 'Status')}</th>
                  <th className="text-left p-2 font-medium text-gray-600">{t('common.date', 'Date')}</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {order.applications.map((app, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="p-2 text-gray-400">{i + 1}</td>
                    <td className="p-2 font-medium text-gray-800">{app.company}</td>
                    <td className="p-2 text-gray-600">{app.jobTitle}</td>
                    <td className="p-2"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{app.portal}</span></td>
                    <td className="p-2 text-gray-500">{app.location || '-'}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        app.status === 'interview_scheduled' ? 'bg-green-50 text-green-700' :
                        app.status === 'shortlisted' ? 'bg-emerald-50 text-emerald-700' :
                        app.status === 'rejected' ? 'bg-red-50 text-red-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>{t(`status.${app.status}`, app.status.replace(/_/g, ' '))}</span>
                    </td>
                    <td className="p-2 text-gray-400 text-xs">{new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td className="p-2">
                      {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-emerald-600"><FiExternalLink size={14} /></a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm py-4 text-center">{t('order.noAppsYet')}</p>
        )}
      </div>

      {/* Reports */}
      {order.reports?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">{t('order.reports')}</h2>
          <div className="space-y-2">
            {order.reports.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700">{r.type === 'weekly' ? 'Weekly' : 'Daily'} Report</p>
                  <p className="text-xs text-gray-400">{new Date(r.generatedAt).toLocaleDateString('en-IN')} · {r.applicationCount} {t('dashboard.applicationsMade')}</p>
                </div>
                <div className="flex gap-2">
                  {r.pdfUrl && <a href={`http://localhost:5001${r.pdfUrl}`} download className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded font-medium hover:bg-red-100">PDF</a>}
                  {r.excelUrl && <a href={`http://localhost:5001${r.excelUrl}`} download className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded font-medium hover:bg-green-100">Excel</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approve */}
      {isClient && order.status === 'review_pending' && (
        <div className="card mb-6 space-y-4">
          <h2 className="font-semibold text-gray-800">{t('order.reviewApprove')}</h2>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                <FiStar fill={n <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <textarea value={review} onChange={e => setReview(e.target.value)} className="input-field" placeholder={t('order.howWasWorker')} />
          <button onClick={handleApprove} className="btn-primary w-full flex items-center justify-center gap-2">
            <FiCheckCircle /> {t('order.approveBtn')}
          </button>
        </div>
      )}

      {/* Chat */}
      {order.workerId && <ChatBox taskId={order._id} messages={order.messages || []} />}

      {['pending', 'assigned', 'in_progress'].includes(order.status) && (
        <div className="text-center py-4 text-sm text-gray-400 animate-pulse">{t('order.liveUpdates')}</div>
      )}
    </div>
  );
}
