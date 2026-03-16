import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FiCheckSquare, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const [open, setOpen] = useState(false);

  const prefix = `/${lang || 'en'}`;

  const handleLogout = () => { logout(); navigate(`${prefix}/login`); };

  const clientLinks = [
    { to: `${prefix}/dashboard`, label: t('nav.dashboard') },
    { to: `${prefix}/vault`, label: t('nav.credentials') },
    { to: `${prefix}/plans`, label: t('nav.plans') },
  ];
  const workerLinks = [
    { to: `${prefix}/worker`, label: t('nav.myWork') },
    { to: `${prefix}/worker/earnings`, label: t('nav.earnings') },
  ];
  const links = user?.role === 'worker' ? workerLinks : clientLinks;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to={prefix} className="flex items-center gap-2 text-xl font-bold text-emerald-600">
            <FiCheckSquare className="text-2xl" /> {t('brand')}
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {links.map(l => <Link key={l.to} to={l.to} className="text-gray-600 hover:text-gray-900 font-medium text-sm">{l.label}</Link>)}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <span className="text-sm">
                    <span className="font-medium text-gray-700">{user.name}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs uppercase font-semibold ${user.role === 'worker' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {user.role === 'worker' ? t('nav.worker') : user.plan}
                    </span>
                  </span>
                  <LanguageSwitcher />
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500"><FiLogOut size={18} /></button>
                </div>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Link to={`${prefix}/login`} className="text-gray-600 hover:text-gray-900 font-medium">{t('nav.login')}</Link>
                <Link to={`${prefix}/register`} className="btn-primary text-sm">{t('nav.getStarted')}</Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={() => setOpen(!open)}>{open ? <FiX size={24} /> : <FiMenu size={24} />}</button>
          </div>
        </div>
        {open && (
          <div className="md:hidden pb-4 border-t pt-2">
            {user ? (
              <div className="flex flex-col gap-2">
                {links.map(l => <Link key={l.to} to={l.to} className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded" onClick={() => setOpen(false)}>{l.label}</Link>)}
                <button onClick={handleLogout} className="px-3 py-2 text-left text-red-500">{t('nav.logout')}</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to={`${prefix}/login`} className="px-3 py-2 text-gray-600 rounded" onClick={() => setOpen(false)}>{t('nav.login')}</Link>
                <Link to={`${prefix}/register`} className="px-3 py-2 text-emerald-600 font-medium rounded" onClick={() => setOpen(false)}>{t('nav.getStarted')}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
