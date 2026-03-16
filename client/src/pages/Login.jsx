import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FiCheckSquare, FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { lang } = useParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(t('auth.welcomeBack'));
      navigate(data.user.role === 'worker' ? `/${lang || 'en'}/worker` : `/${lang || 'en'}/dashboard`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to={`/${lang || 'en'}`} className="inline-flex items-center gap-2 text-2xl font-bold text-emerald-600">
            <FiCheckSquare /> TaskDone
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{t('auth.welcomeBack')}</h1>
          <p className="text-gray-500 mt-1">{t('auth.signInSubtitle')}</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 text-gray-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10" placeholder="Enter password" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('auth.noAccount')} <Link to={`/${lang || 'en'}/register`} className="text-emerald-600 font-medium hover:underline">{t('auth.signUp')}</Link>
        </p>
      </div>
    </div>
  );
}
