import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <main>
      {/* Gov banner */}
      <div className="bg-green-800 text-white text-center py-2 text-sm font-medium tracking-wide">
        {t('home.gov')}
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-green-50 to-white pt-20 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-300 rounded-full py-1.5 px-4 mb-7">
            <span className="w-2.5 h-2.5 bg-green-600 rounded-full inline-block animate-pulse"></span>
            <span className="text-sm font-semibold text-green-700">{t('home.liveMarket')}</span>
          </div>
          
          <h1 className="font-extrabold text-5xl md:text-6xl text-gray-900 leading-tight mb-5">
            {t('home.heroTitle1')}<br />
            <span className="text-green-800">{t('home.heroTitle2')}</span>
          </h1>
          
          <p className="text-xl text-gray-700 leading-relaxed mb-12 max-w-2xl mx-auto">
            {t('home.heroSubtitle')}
          </p>

          {/* Big action buttons */}
          <div className="flex flex-wrap gap-6 justify-center">
            <button onClick={() => navigate('/farmer')}
              className="py-6 px-10 bg-green-800 text-white rounded-2xl font-extrabold text-2xl flex flex-col items-center gap-2 shadow-[0_8px_32px_rgba(30,107,60,0.3)] hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(30,107,60,0.38)] transition-all duration-200 min-w-[260px]">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="rgba(255,255,255,0.15)" />
                <path d="M24 10C17 10 12 16 12 24c0 3 1 5.5 2.5 7.5L24 38l9.5-6.5C35 29.5 36 27 36 24c0-8-5-14-12-14z" fill="white" opacity=".9"/>
                <path d="M24 18v10M20 20l4-2 4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{t('home.iamFarmer')}</span>
              <span className="text-sm font-medium opacity-80 mt-1">{t('home.iamFarmerSub')}</span>
            </button>

            <button onClick={() => navigate('/buyer')}
              className="py-6 px-10 bg-white text-green-800 border-[3px] border-green-800 rounded-2xl font-extrabold text-2xl flex flex-col items-center gap-2 shadow-[0_8px_32px_rgba(30,107,60,0.12)] hover:-translate-y-1 hover:bg-green-50 transition-all duration-200 min-w-[260px]">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#E8F5EE" />
                <path d="M14 18h20l-2 12H16L14 18z" fill="#1E6B3C" opacity=".85"/>
                <path d="M14 18l-2-4H10M20 30v4M28 30v4" stroke="#1E6B3C" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{t('home.iamBuyer')}</span>
              <span className="text-sm font-medium opacity-70 mt-1">{t('home.iamBuyerSub')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-green-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex justify-around flex-wrap gap-6">
          {[
            { num: t('home.stat1.num'), label: t('home.stat1.label'), sub: t('home.stat1.sub') },
            { num: t('home.stat2.num'), label: t('home.stat2.label'), sub: t('home.stat2.sub') },
            { num: t('home.stat3.num'), label: t('home.stat3.label'), sub: t('home.stat3.sub') },
            { num: t('home.stat4.num'), label: t('home.stat4.label'), sub: t('home.stat4.sub') },
          ].map((s, idx) => (
            <div key={idx} className="text-center text-white">
              <div className="font-extrabold text-3xl md:text-4xl">{s.num}</div>
              <div className="font-semibold text-sm opacity-90 mt-1">{s.label}</div>
              <div className="text-xs opacity-75 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center font-bold text-3xl mb-12 text-gray-900">
            {t('home.feat.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🤖', title: t('home.feat1.title'), desc: t('home.feat1.desc') },
              { icon: '🚚', title: t('home.feat2.title'), desc: t('home.feat2.desc') },
              { icon: '✅', title: t('home.feat3.title'), desc: t('home.feat3.desc') },
              { icon: '💸', title: t('home.feat4.title'), desc: t('home.feat4.desc') },
            ].map((f, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-3 text-gray-900">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
