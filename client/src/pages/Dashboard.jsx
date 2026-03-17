import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiRefreshCw, FiFileText, FiPhone, FiTrendingUp, FiChevronRight, FiShield, FiMail, FiX } from 'react-icons/fi';

export default function Dashboard() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModeModal, setShowModeModal] = useState(false);

  const prefix = `/${lang || 'en'}`;

  useEffect(() => {
    if (user && !user.onboardingComplete) navigate(`${prefix}/onboarding`);
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        api.get('/orders/my'),
        api.get('/orders/stats/summary'),
      ]);
      setOrders(ordersRes.data);
      setStats(statsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const createOrder = async (serviceMode) => {
    setShowModeModal(false);
    try {
      await api.post('/orders', {
        serviceMode,
        preferences: {
          roles: user?.profile?.preferredRoles || [],
          locations: user?.profile?.preferredLocations || [],
          portals: serviceMode === 'direct' ? ['company_website', 'email'] : ['naukri', 'linkedin', 'indeed'],
          experienceLevel: user?.profile?.experience || 'fresher',
          salaryRange: user?.profile?.expectedSalary || '',
          remoteOnly: user?.profile?.openToRemote || false,
        },
      });
      toast.success(t('dashboard.orderCreated'));
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    }
  };

  const statusLabels = {
    pending: { label: t('status.pending'), color: 'bg-yellow-50 text-yellow-700' },
    assigned: { label: t('status.assigned'), color: 'bg-blue-50 text-blue-700' },
    in_progress: { label: t('status.in_progress'), color: 'bg-emerald-50 text-emerald-700' },
    review_pending: { label: t('status.review_pending'), color: 'bg-orange-50 text-orange-700' },
    completed: { label: t('status.completed'), color: 'bg-green-50 text-green-700' },
    cancelled: { label: t('status.cancelled'), color: 'bg-gray-50 text-gray-500' },
  };

  const activeOrder = orders.find(o => ['pending', 'assigned', 'in_progress'].includes(o.status));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">
            {user?.applicationsUsed || 0} / {user?.applicationsLimit || 0} {t('dashboard.applicationsUsed')}
            <span className="mx-2">·</span>
            <span className="font-medium text-emerald-600 uppercase">{user?.plan}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="btn-secondary text-sm flex items-center gap-2"><FiRefreshCw size={14} /></button>
          {!activeOrder && (
            <button onClick={() => setShowModeModal(true)} className="btn-primary flex items-center gap-2 text-sm">
              <FiPlus size={14} /> {t('dashboard.startApplying')}
            </button>
          )}
        </div>
      </div>

      {/* Service Mode Selection Modal */}
      {showModeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative">
            <button onClick={() => setShowModeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t('serviceMode.title')}</h2>
            <p className="text-sm text-gray-500 mb-6">{t('serviceMode.subtitle')}</p>

            <div className="space-y-4">
              {/* Direct Mode */}
              <button
                onClick={() => createOrder('direct')}
                className="w-full text-left p-4 rounded-xl border-2 border-blue-400 bg-blue-50 hover:border-blue-500 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200">
                    <FiMail className="text-blue-600" size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('serviceMode.direct.title')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('serviceMode.direct.desc')}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{t('serviceMode.direct.tag1')}</span>
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{t('serviceMode.direct.tag2')}</span>
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{t('serviceMode.direct.tag3')}</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Guided Mode */}
              <button
                onClick={() => createOrder('portal')}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200">
                    <FiFileText className="text-emerald-600" size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{t('serviceMode.portal.title')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('serviceMode.portal.desc')}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{t('serviceMode.portal.tag1')}</span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{t('serviceMode.portal.tag2')}</span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{t('serviceMode.portal.tag3')}</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-emerald-600">{stats.totalApplications || 0}</div>
          <div className="text-sm text-gray-500">{t('dashboard.applicationsMade')}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalInterviews || 0}</div>
          <div className="text-sm text-gray-500">{t('dashboard.interviewCalls')}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.conversionRate || 0}%</div>
          <div className="text-sm text-gray-500">{t('dashboard.conversionRate')}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.totalOrders || 0}</div>
          <div className="text-sm text-gray-500">{t('dashboard.totalOrders')}</div>
        </div>
      </div>

      {/* Interview Guarantee Banner */}
      {user?.guaranteeEligible && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiTrendingUp className="text-emerald-600 text-xl" />
            <div>
              <p className="font-medium text-emerald-800">{t('dashboard.guaranteeActive')}</p>
              <p className="text-sm text-emerald-600">
                {user.interviewCallsReceived || 0} / {user.plan === 'max' ? 20 : user.plan === 'mega' ? 30 : 10} {t('dashboard.callsReceived')}
                {(user.interviewCallsReceived || 0) >= (user.plan === 'max' ? 20 : 10) ? ` — ${t('dashboard.targetMet')}` : ''}
              </p>
            </div>
          </div>
          <Link to={`${prefix}/plans`} className="text-sm text-emerald-600 font-medium hover:underline">{t('common.details')}</Link>
        </div>
      )}

      {/* Orders */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.yourOrders')}</h2>
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="text-gray-400 text-lg mb-2">{t('dashboard.noOrders')}</p>
          <p className="text-gray-400 text-sm mb-6">{t('dashboard.noOrdersHint')}</p>
          <button onClick={() => setShowModeModal(true)} className="btn-primary inline-flex items-center gap-2"><FiPlus /> {t('dashboard.startApplying')}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const s = statusLabels[order.status] || statusLabels.pending;
            const isDirect = order.serviceMode === 'direct';
            return (
              <Link key={order._id} to={`${prefix}/order/${order._id}`} className="card hover:shadow-md transition-shadow block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isDirect ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                      {isDirect ? <FiMail className="text-blue-600 text-xl" /> : <FiFileText className="text-emerald-600 text-xl" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">
                          {order.completedApplications} / {order.totalApplications} {t('dashboard.applications')}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                        {isDirect && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{t('serviceMode.direct.badge')}</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {order.plan.toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {order.workerId && <span> · {order.workerId.name || 'Assigned'}</span>}
                      </p>
                      {order.interviewCalls > 0 && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <FiPhone size={10} /> {order.interviewCalls} {t('dashboard.interviewCallCount')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:block w-32">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isDirect ? 'bg-blue-500' : 'bg-emerald-500'}`}
                          style={{ width: `${(order.completedApplications / order.totalApplications) * 100}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-right">{Math.round((order.completedApplications / order.totalApplications) * 100)}%</p>
                    </div>
                    <FiChevronRight className="text-gray-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Upgrade prompt */}
      {user?.plan === 'free' && (
        <div className="mt-8 bg-emerald-600 rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">{t('dashboard.upgradeTitle')}</h3>
          <p className="text-emerald-100 mb-4">{t('dashboard.upgradeDesc')}</p>
          <Link to={`${prefix}/plans`} className="bg-white text-emerald-600 px-6 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition-colors inline-block">
            {t('dashboard.viewPlans')}
          </Link>
        </div>
      )}
    </div>
  );
}
