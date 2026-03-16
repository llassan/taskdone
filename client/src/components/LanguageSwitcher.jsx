import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supportedLanguages } from '../i18n';
import { FiGlobe } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const switchLanguage = (newLang) => {
    i18n.changeLanguage(newLang);
    // Replace current lang prefix in URL with new one
    const pathWithoutLang = location.pathname.replace(`/${lang}`, '') || '/';
    navigate(`/${newLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}${location.search}`);
    setOpen(false);
  };

  const currentLang = i18n.language;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium px-2 py-1 rounded hover:bg-gray-50"
      >
        <FiGlobe size={16} />
        <span className="hidden sm:inline">{t(`languages.${currentLang}`)}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px] z-50">
          {supportedLanguages.map((code) => (
            <button
              key={code}
              onClick={() => switchLanguage(code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                code === currentLang ? 'text-emerald-600 font-medium bg-emerald-50' : 'text-gray-700'
              }`}
            >
              {t(`languages.${code}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
