import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ChatBox from '../components/ChatBox';
import api from '../utils/api';
import socket from '../utils/socket';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlay, FiCheck, FiPlus } from 'react-icons/fi';

export default function WorkerOrderDetail() {
  const { t } = useTranslation();
  const { id, lang } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Application form
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [portal, setPortal] = useState('naukri');
  const [jobUrl, setJobUrl] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [coverLetter, setCoverLetter] = useState(false);
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [workerNotes, setWorkerNotes] = useState('');
  const fileRef = useRef();

  const fetchOrder = async () => {
    try { const res = await api.get(`/orders/${id}`); setOrder(res.data); }
    catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);
  useEffect(() => {
    socket.emit('join-order', id);
    return () => socket.emit('leave-order', id);
  }, [id]);

  const handleStart = async () => {
    try { await api.patch(`/orders/${id}/start`); toast.success('Started!'); fetchOrder(); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleLogApplication = async (e) => {
    e.preventDefault();
    if (!company || !jobTitle) { toast.error('Company and job title required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('company', company);
      fd.append('jobTitle', jobTitle);
      fd.append('portal', portal);
      fd.append('jobUrl', jobUrl);
      fd.append('location', location);
      fd.append('salary', salary);
      fd.append('coverLetterUsed', coverLetter);
      fd.append('notes', notes);
      if (screenshot) fd.append('screenshot', screenshot);

      await api.post(`/orders/${id}/application`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Application logged! (${order.completedApplications + 1}/${order.totalApplications})`);
      setCompany(''); setJobTitle(''); setJobUrl(''); setLocation(''); setSalary(''); setNotes(''); setScreenshot(null);
      if (fileRef.current) fileRef.current.value = '';
      fetchOrder();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleComplete = async () => {
    try {
      await api.patch(`/orders/${id}/complete`, { workerNotes });
      toast.success('Submitted for review!');
      fetchOrder();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">{t('common.loading')}</div>;

  const progress = Math.round((order.completedApplications / order.totalApplications) * 100);
  const langPrefix = `/${lang || 'en'}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to={`${langPrefix}/worker`} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"><FiArrowLeft /> {t('common.back')}</Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-gray-900">{order.completedApplications}/{order.totalApplications} {t('order.applications')}</h1>
          <span className="font-bold text-emerald-600">₹{order.payout} payout</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-gray-500">{progress}% complete · {order.plan.toUpperCase()} plan</p>

        {/* Client preferences */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">{t('worker.clientInstructions')}:</span> {order.clientId?.name}</p>
          {order.preferences?.roles?.length > 0 && <p><span className="font-medium">{t('worker.targetRoles')}:</span> {order.preferences.roles.join(', ')}</p>}
          {order.preferences?.locations?.length > 0 && <p><span className="font-medium">{t('worker.locations')}:</span> {order.preferences.locations.join(', ')}</p>}
          {order.preferences?.portals?.length > 0 && <p><span className="font-medium">{t('worker.portals')}:</span> {order.preferences.portals.join(', ')}</p>}
          {order.preferences?.salaryRange && <p><span className="font-medium">{t('worker.salary')}:</span> {order.preferences.salaryRange}</p>}
          {order.preferences?.experienceLevel && <p><span className="font-medium">{t('status.experience')}:</span> {order.preferences.experienceLevel}</p>}
          {order.preferences?.customInstructions && (
            <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-800">{t('worker.customInstructions')}:</p>
              <p className="text-yellow-700">{order.preferences.customInstructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Start */}
      {order.status === 'assigned' && (
        <div className="card mb-6 text-center py-8">
          <button onClick={handleStart} className="btn-primary text-lg px-8 py-3 flex items-center gap-2 mx-auto">
            <FiPlay /> {t('worker.startApplying')}
          </button>
        </div>
      )}

      {/* Log Application Form */}
      {order.status === 'in_progress' && order.completedApplications < order.totalApplications && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">{t('worker.logApplication')} #{order.completedApplications + 1}</h2>
          <form onSubmit={handleLogApplication} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input value={company} onChange={e => setCompany(e.target.value)} className="input-field" placeholder={`${t('worker.company')} *`} required />
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-field" placeholder={`${t('worker.jobTitle')} *`} required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select value={portal} onChange={e => setPortal(e.target.value)} className="input-field">
                <option value="naukri">Naukri</option>
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
                <option value="internshala">Internshala</option>
                <option value="freshersworld">Freshersworld</option>
                <option value="other">Other</option>
              </select>
              <input value={location} onChange={e => setLocation(e.target.value)} className="input-field" placeholder={t('worker.location')} />
              <input value={salary} onChange={e => setSalary(e.target.value)} className="input-field" placeholder={t('worker.salary')} />
            </div>
            <input value={jobUrl} onChange={e => setJobUrl(e.target.value)} className="input-field" placeholder={t('worker.jobUrl')} />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={coverLetter} onChange={e => setCoverLetter(e.target.checked)} className="rounded" />
                {t('worker.coverLetter')}
              </label>
              <input ref={fileRef} type="file" accept="image/*" onChange={e => setScreenshot(e.target.files[0])} className="text-sm text-gray-500" />
            </div>
            <input value={notes} onChange={e => setNotes(e.target.value)} className="input-field" placeholder={t('worker.notes')} />
            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiPlus /> {submitting ? t('worker.logging') : t('worker.logBtn')}
            </button>
          </form>
        </div>
      )}

      {/* Recent Applications */}
      {order.applications?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">{t('order.applications')} ({order.applications.length})</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[...order.applications].reverse().map((app, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <div>
                  <span className="font-medium text-gray-800">{app.company}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span className="text-gray-600">{app.jobTitle}</span>
                </div>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{app.portal}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit for review */}
      {order.status === 'in_progress' && (
        <div className="card mb-6 space-y-3">
          <h2 className="font-semibold text-gray-800">{t('worker.submitReview')}</h2>
          <textarea value={workerNotes} onChange={e => setWorkerNotes(e.target.value)} className="input-field min-h-[80px]"
            placeholder={t('worker.submitNotes')} />
          <button onClick={handleComplete} className="bg-orange-500 text-white w-full py-2.5 rounded-lg font-medium hover:bg-orange-600 flex items-center justify-center gap-2">
            <FiCheck /> {t('worker.submitBtn')}
          </button>
        </div>
      )}

      <ChatBox taskId={order._id} messages={order.messages || []} />
    </div>
  );
}
