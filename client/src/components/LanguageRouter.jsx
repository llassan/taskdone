import { useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n';

export default function LanguageRouter() {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // If lang param is valid, sync i18n
    if (lang && supportedLanguages.includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    }
  }, [lang, i18n]);

  // If no lang or invalid lang, redirect to /en/...
  useEffect(() => {
    if (!lang || !supportedLanguages.includes(lang)) {
      const preferred = i18n.language?.split('-')[0] || 'en';
      const target = supportedLanguages.includes(preferred) ? preferred : 'en';
      navigate(`/${target}`, { replace: true });
    }
  }, [lang, navigate, i18n]);

  if (!lang || !supportedLanguages.includes(lang)) return null;

  return <Outlet />;
}
