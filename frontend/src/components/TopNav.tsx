import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function TopNav({ isVerified, onLogin }: { isVerified: boolean, onLogin: () => void }) {
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
  };

  const active = location.pathname.substring(1) || 'home';

  return (
    <header className="sticky top-0 z-50 bg-white border-b-4 border-green-800">
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => handleNav('/')} className="flex items-center gap-3 shrink-0 focus:outline-none">
          <div className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C8 3 4 7 4 12c0 2 .8 4 2 5.5L12 21l6-3.5C19.2 16 20 14 20 12c0-5-4-9-8-9z" fill="white" opacity=".9"/>
              <path d="M12 8v8M8 10l4-2 4 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-left">
            <div className="font-extrabold text-xl text-green-800 leading-tight tracking-tight">{t('nav.title')}</div>
            <div className="text-[10px] text-gray-500 tracking-wider font-medium uppercase">{t('nav.subtitle')}</div>
          </div>
        </button>

        {/* Nav links */}
        <nav className="hidden md:flex gap-2 ml-8">
          {[
            { id: 'farmer', label: t('nav.farmer') },
            { id: 'buyer', label: t('nav.buyer') },
            { id: 'admin', label: t('nav.admin') },
          ].map(item => (
            <button key={item.id} onClick={() => handleNav('/' + item.id)}
              className={`px-4 py-1.5 rounded-md font-semibold text-sm transition-all duration-150 ${
                active === item.id ? 'bg-green-50 text-green-800' : 'text-gray-700 hover:bg-gray-100'
              }`}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          {/* Helpline */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-yellow-100 rounded-md border border-yellow-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24A11.36 11.36 0 0020 15.5c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57-.11.36-.02.76.24 1.02l-2.69 2.2z" fill="#D97706"/>
            </svg>
            <span className="font-bold text-sm text-yellow-800">{t('nav.helpline')}</span>
          </div>

          {/* Language toggle */}
          <div className="flex border-2 border-gray-200 rounded-md overflow-hidden">
            {['en', 'hi'].map(l => (
              <button key={l} onClick={() => toggleLanguage(l as 'en' | 'hi')}
                className={`px-3 py-1 font-bold text-xs transition-colors ${
                  language === l ? 'bg-green-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}>
                {l === 'hi' ? 'हि' : 'EN'}
              </button>
            ))}
          </div>

          {/* Login button */}
          {!isVerified ? (
            <button onClick={onLogin}
              className="px-5 py-2 bg-green-800 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-[0_2px_8px_rgba(30,107,60,0.25)] hover:bg-green-700 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 20c0-3.31 3.58-6 8-6s8 2.69 8 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {t('nav.login')}
            </button>
          ) : (
            <div className="px-4 py-1.5 bg-green-100 text-green-800 rounded-lg font-bold text-sm flex items-center gap-2 border border-green-300 cursor-pointer" onClick={() => handleNav('/')}>
               {t('nav.verified')}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
