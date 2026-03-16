import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import { FiDollarSign, FiCheckSquare, FiStar, FiTrendingUp } from 'react-icons/fi';

export default function Earnings() {
  const { t } = useTranslation();
  const [earnings, setEarnings] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsRes, tasksRes] = await Promise.all([
          api.get('/user/earnings'),
          api.get('/tasks/assigned', { params: { status: 'completed' } }),
        ]);
        setEarnings(earningsRes.data);
        setTasks(tasksRes.data.tasks);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('worker.earnings')}</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <FiDollarSign className="mx-auto text-2xl text-emerald-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">₹{earnings.totalEarnings || 0}</div>
          <div className="text-sm text-gray-500">{t('worker.earnings')}</div>
        </div>
        <div className="card text-center">
          <FiCheckSquare className="mx-auto text-2xl text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{earnings.totalCompleted || 0}</div>
          <div className="text-sm text-gray-500">{t('worker.applicationsFiled')}</div>
        </div>
        <div className="card text-center">
          <FiStar className="mx-auto text-2xl text-yellow-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">{earnings.rating || 5.0}</div>
          <div className="text-sm text-gray-500">{t('worker.rating')}</div>
        </div>
        <div className="card text-center">
          <FiTrendingUp className="mx-auto text-2xl text-orange-500 mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            ₹{earnings.totalCompleted ? Math.round(earnings.totalEarnings / earnings.totalCompleted) : 0}
          </div>
          <div className="text-sm text-gray-500">{t('worker.payout')}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">{t('status.completed')}</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">{t('worker.noOrders')}</p>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{task.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(task.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">₹{task.payout}</span>
                  {task.clientRating && (
                    <div className="flex items-center gap-0.5 justify-end mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={10} className={i < task.clientRating ? 'text-yellow-400' : 'text-gray-200'} fill={i < task.clientRating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
