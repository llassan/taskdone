import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import socket from '../utils/socket';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiDollarSign, FiCheckSquare, FiStar, FiZap, FiChevronRight } from 'react-icons/fi';

export default function WorkerDashboard() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const prefix = `/${lang || 'en'}`;

  const [orders, setOrders] = useState([]);
  const [available, setAvailable] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, availRes, earnRes] = await Promise.all([
        api.get('/orders/assigned'),
        api.get('/orders/available'),
        api.get('/user/earnings'),
      ]);
      setOrders(ordersRes.data);
      setAvailable(availRes.data);
      setEarnings(earnRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    socket.on('new-order', fetchData);
    return () => socket.off('new-order', fetchData);
  }, []);

  const claimOrder = async (orderId) => {
    setClaiming(orderId);
    try {
      await api.patch(`/orders/${orderId}/claim`);
      toast.success('Order claimed!');
      fetchData();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setClaiming(''); }
  };

  const statusColor = {
    assigned: 'bg-blue-50 text-blue-700',
    in_progress: 'bg-emerald-50 text-emerald-700',
    review_pending: 'bg-orange-50 text-orange-700',
    completed: 'bg-green-50 text-green-700',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('worker.dashboard')}</h1>
        <button onClick={fetchData} className="btn-secondary text-sm flex items-center gap-2"><FiRefreshCw size={14} /> {t('common.refresh')}</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <FiDollarSign className="mx-auto text-xl text-emerald-500 mb-1" />
          <div className="text-2xl font-bold text-gray-900">{'\u20B9'}{earnings.totalEarnings || 0}</div>
          <div className="text-xs text-gray-500">{t('worker.earnings')}</div>
        </div>
        <div className="card text-center">
          <FiCheckSquare className="mx-auto text-xl text-blue-500 mb-1" />
          <div className="text-2xl font-bold text-gray-900">{earnings.totalApplicationsFiled || 0}</div>
          <div className="text-xs text-gray-500">{t('worker.applicationsFiled')}</div>
        </div>
        <div className="card text-center">
          <FiStar className="mx-auto text-xl text-yellow-500 mb-1" />
          <div className="text-2xl font-bold text-gray-900">{earnings.rating || 5.0}</div>
          <div className="text-xs text-gray-500">{t('worker.rating')}</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{earnings.currentOrders || 0}</div>
          <div className="text-xs text-gray-500">{t('worker.activeOrders')}</div>
        </div>
      </div>

      {/* Available Orders */}
      {available.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('worker.availableOrders')} ({available.length})</h2>
          <div className="space-y-3">
            {available.map(order => (
              <div key={order._id} className="card flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{order.totalApplications} {t('dashboard.applications')} · {order.plan.toUpperCase()}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Portals: {order.preferences?.portals?.join(', ') || 'All'}
                    {order.preferences?.roles?.length > 0 && <span> · Roles: {order.preferences.roles.join(', ')}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-emerald-600">{'\u20B9'}{order.payout}</div>
                    <div className="text-xs text-gray-400">{t('worker.payout')}</div>
                  </div>
                  <button onClick={() => claimOrder(order._id)} disabled={claiming === order._id}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 text-sm disabled:opacity-50">
                    {claiming === order._id ? '...' : <><FiZap className="inline" /> {t('worker.claim')}</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Orders */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('worker.myOrders')}</h2>
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 card text-gray-400">{t('worker.noOrders')}</div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link key={order._id} to={`${prefix}/worker/order/${order._id}`} className="card hover:shadow-md transition-shadow block">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{order.completedApplications}/{order.totalApplications} {t('dashboard.applications')}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] || 'bg-gray-50 text-gray-500'}`}>{t(`status.${order.status}`)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Client: {order.clientId?.name || 'N/A'} · {'\u20B9'}{order.payout} {t('worker.payout')}
                  </p>
                </div>
                <FiChevronRight className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
