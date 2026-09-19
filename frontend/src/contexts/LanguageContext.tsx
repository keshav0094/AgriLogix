import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Try to load from localStorage, default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('agrilogix_lang');
    return (saved === 'en' || saved === 'hi') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('agrilogix_lang', language);
  }, [language]);

  const toggleLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      // For dynamic DB data where a translation might not exist, return the original string
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
