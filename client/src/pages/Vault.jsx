import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiShield, FiPlus, FiTrash2, FiKey, FiLock } from 'react-icons/fi';

const suggestions = [
  { key: 'naukri_email', label: 'Naukri Email' },
  { key: 'naukri_password', label: 'Naukri Password' },
  { key: 'linkedin_email', label: 'LinkedIn Email' },
  { key: 'linkedin_password', label: 'LinkedIn Password' },
  { key: 'incometax_pan', label: 'Income Tax PAN' },
  { key: 'incometax_password', label: 'Income Tax Password' },
  { key: 'gst_username', label: 'GST Username' },
  { key: 'gst_password', label: 'GST Password' },
];

export default function Vault() {
  const { t } = useTranslation();
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchKeys = async () => {
    try { const res = await api.get('/user/vault/keys'); setKeys(res.data.keys); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchKeys(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newKey || !newValue) { toast.error('Both key and value required'); return; }
    try {
      await api.post('/user/vault', { credentials: { [newKey]: newValue } });
      toast.success('Credential stored');
      setNewKey(''); setNewValue('');
      fetchKeys();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (key) => {
    try { await api.delete(`/user/vault/${key}`); toast.success('Deleted'); fetchKeys(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2"><FiShield className="text-emerald-600 text-2xl" /><h1 className="text-2xl font-bold text-gray-900">{t('vault.title')}</h1></div>
      <p className="text-gray-500 mb-8">{t('vault.subtitle')}</p>

      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">{t('vault.addCredential')}</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vault.key')}</label>
              <input value={newKey} onChange={e => setNewKey(e.target.value)} className="input-field" placeholder="e.g. naukri_email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('vault.value')}</label>
              <input type="password" value={newValue} onChange={e => setNewValue(e.target.value)} className="input-field" placeholder="Enter value" />
            </div>
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2 text-sm"><FiPlus /> {t('vault.store')}</button>
        </form>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">{t('vault.quickAdd')}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.filter(s => !keys.includes(s.key)).map(s => (
              <button key={s.key} onClick={() => setNewKey(s.key)} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100">+ {s.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">{t('vault.stored')}</h2>
        {loading ? <div className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div></div>
        : keys.length === 0 ? <div className="text-center py-8 text-gray-400"><FiLock className="mx-auto text-3xl mb-2" /><p>{t('vault.noCredentials')}</p></div>
        : <div className="space-y-2">{keys.map(k => (
          <div key={k} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3"><FiKey className="text-gray-400" /><span className="font-mono text-sm text-gray-700">{k}</span></div>
            <div className="flex items-center gap-3"><span className="text-xs text-gray-400">••••••</span><button onClick={() => handleDelete(k)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button></div>
          </div>
        ))}</div>}
      </div>
    </div>
  );
}
