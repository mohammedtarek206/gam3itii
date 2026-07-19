import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';

// Detect default language
const getInitialLanguage = () => {
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang) return savedLang;

  // Detect browser language
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang && browserLang.startsWith('en')) {
    return 'en';
  }
  return 'ar'; // Default fallback
};

const initialLang = getInitialLanguage();
localStorage.setItem('i18nextLng', initialLang);

// Update HTML tag attributes on start
document.documentElement.lang = initialLang;
document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
document.body.classList.toggle('ltr', initialLang === 'en');

i18n.use(initReactI18next).init({
  resources: { ...ar, ...en },
  lng: initialLang,
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

// Update attributes on language change
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('ltr', lng === 'en');
});

export default i18n;
