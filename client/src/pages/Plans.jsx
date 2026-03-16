import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiCheck, FiTrendingUp } from 'react-icons/fi';

export default function Plans() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState('');

  useEffect(() => { api.get('/user/plans').then(r => setPlans(r.data)).catch(() => {}); }, []);

  const handleUpgrade = async (key) => {
    if (key === user?.plan) return;
    setLoading(key);
    try {
      await api.post('/user/upgrade', { plan: key });
      toast.success(`Upgraded to ${plans[key].name}!`);
      window.location.reload();
    } catch { toast.error('Failed'); }
    finally { setLoading(''); }
  };

  const colors = {
    free: 'border-gray-200',
    starter: 'border-emerald-200',
    pro: 'border-emerald-400 ring-2 ring-emerald-100',
    max: 'border-purple-300',
    mega: 'border-purple-400 ring-2 ring-purple-100',
  };

  const monthlyPlans = Object.entries(plans).filter(([key]) => key !== 'mega');
  const megaPlan = plans.mega;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('plans.title')}</h1>
        <p className="text-gray-500">{t('plans.subtitle')}</p>
      </div>

      {/* Monthly Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {monthlyPlans.map(([key, plan]) => (
          <div key={key} className={`card border-2 ${colors[key]} relative`}>
            {key === 'pro' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-medium">{t('pricing.popular')}</div>}
            {key !== 'free' && (
              <div className="absolute -top-3 right-3 bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {t(`pricing.${key}.save`)}
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-2 mb-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{plan.price === 0 ? t('pricing.free.name') : `₹${plan.price}`}</span>
              {key !== 'free' && <span className="text-sm text-gray-400 line-through">{t(`pricing.${key}.wasPrice`)}</span>}
            </div>
            <div className="text-sm text-emerald-600 font-medium mb-4">{plan.applications} {t('dashboard.applications')}</div>
            <ul className="space-y-2 mb-6">{plan.features?.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600"><FiCheck className="text-emerald-500 mt-0.5 flex-shrink-0" size={14} /> {f}</li>
            ))}</ul>
            {plan.interviewGuarantee && (
              <div className="bg-emerald-50 rounded-lg p-2 mb-4 text-xs text-emerald-700 flex items-center gap-1">
                <FiTrendingUp size={12} /> {plan.guaranteeText}
              </div>
            )}
            <button onClick={() => handleUpgrade(key)} disabled={key === user?.plan || loading === key}
              className={`w-full py-2.5 rounded-lg font-medium text-sm ${key === user?.plan ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : key === 'pro' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {key === user?.plan ? t('pricing.current') : loading === key ? '...' : `${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Mega Plan - 3 Month Discount */}
      {megaPlan && (
        <div className="mt-8 max-w-3xl mx-auto">
          <div className={`card border-2 ${colors.mega} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-4 py-1.5 rounded-bl-lg font-medium">
              {t('pricing.mega.badge')}
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{megaPlan.name}</h3>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-gray-900">₹{megaPlan.price}</span>
                  <span className="text-lg text-gray-400 line-through">₹5,997</span>
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{t('pricing.mega.savings')}</span>
                </div>
                <div className="text-sm text-purple-600 font-medium mt-1">{megaPlan.applications} {t('dashboard.applications')} / {megaPlan.duration}</div>
                {megaPlan.interviewGuarantee && (
                  <div className="bg-purple-50 rounded-lg p-2 mt-3 text-xs text-purple-700 flex items-center gap-1 inline-flex">
                    <FiTrendingUp size={12} /> {megaPlan.guaranteeText}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <ul className="space-y-1.5 mb-4">
                  {megaPlan.features?.slice(0, 6).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCheck className="text-purple-500 flex-shrink-0" size={14} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleUpgrade('mega')} disabled={'mega' === user?.plan || loading === 'mega'}
                  className={`w-full py-3 rounded-lg font-medium text-sm ${'mega' === user?.plan ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                  {'mega' === user?.plan ? t('pricing.current') : loading === 'mega' ? '...' : t('pricing.mega.cta')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
