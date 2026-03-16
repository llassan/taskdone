import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

const supportedLanguages = ['en', 'hi', 'es', 'fr', 'de'];

// Custom language detector that reads from URL path: /en/dashboard, /hi/plans, etc.
const pathLanguageDetector = {
  name: 'pathDetector',
  lookup() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0 && supportedLanguages.includes(segments[0])) {
      return segments[0];
    }
    return undefined;
  },
  cacheUserLanguage(lng) {
    localStorage.setItem('i18nextLng', lng);
  },
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(pathLanguageDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
    },
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    detection: {
      order: ['pathDetector', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export { supportedLanguages };
export default i18n;
