import { useState, useEffect } from 'react';
import { getListings, getCropsPrices } from '../services/api';
import Select from 'react-select';
import { useLanguage } from '../contexts/LanguageContext';
import { useOrders } from '../contexts/OrderContext';
import { useNavigate } from 'react-router-dom';

export function BuyerMarketplace() {
  const { t } = useLanguage();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [search, setSearch] = useState('');
  const [grades, setGrades] = useState<string[]>(['A']);
  const [minStars, setMinStars] = useState(0);
  const [selectedCrops, setSelectedCrops] = useState<{label: string, value: string}[]>([]);
  const [cropOptions, setCropOptions] = useState<{label: string, value: string}[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const fetchMarketplace = async () => {
      setLoading(true);
      
      // 1. Fetch Top 30 crops and their DB modal prices
      let fetchedCrops: any[] = [];
      try {
        const res = await getCropsPrices(30);
        if (res?.data?.data) {
          fetchedCrops = res.data.data;
        }
      } catch (e) {
        console.error("Failed to fetch crop prices", e);
      }
      
      if (fetchedCrops.length > 0) {
        // Set the multi-select options
        setCropOptions(fetchedCrops.map(c => ({ label: t(c.commodity), value: c.commodity })));
        
        // Generate 500 realistic listings distributed among these crops
        const generatedListings = [];
        const regions = ['Ludhiana, Punjab', 'Karnal, Haryana', 'Ujjain, MP', 'Nagpur, Maharashtra', 'Jaipur, Rajasthan', 'Patna, Bihar', 'Surat, Gujarat', 'Mysore, Karnataka'];
        const images = ['photo-1574323347407-f5e1ad6d020b', 'photo-1536304929831-ee1ca9d44906', 'photo-1599940824399-b87987ceb72a', 'photo-1518537079-8b63f76a5fd4', 'photo-1618886614638-80e3c103d31a', 'photo-1471193945509-9ad0617afabf'];
        const gradesList = ['A+', 'A', 'B'];
        
        for (let i = 1; i <= 500; i++) {
          const randomCrop = fetchedCrops[Math.floor(Math.random() * fetchedCrops.length)];
          const basePrice = randomCrop.latest_price || 3000;
          // Price variance +/- 10%
          const variance = basePrice * 0.10;
          const price = Math.round(basePrice + (Math.random() * variance * 2 - variance));
          
          generatedListings.push({
            id: i,
            crop: randomCrop.commodity,
            farmer: `KSN-${Math.floor(100 + Math.random() * 900)}`,
            region: regions[Math.floor(Math.random() * regions.length)],
            weight: `${Math.floor(10 + Math.random() * 190)} Quintal`,
            price: price,
            grade: gradesList[Math.floor(Math.random() * gradesList.length)],
            rating: parseFloat((2.5 + Math.random() * 2.5).toFixed(1)), // 2.5 to 5.0
            img: images[Math.floor(Math.random() * images.length)]
          });
        }
        setListings(generatedListings);
      } else {
        // Fallback dummy data if DB is entirely empty
        setListings([
          { id: 1, crop: 'Wheat', farmer: 'KSN-812', region: 'Ludhiana, Punjab', weight: '40 Quintal', price: 2510, grade: 'A', rating: 5.0, img: 'photo-1574323347407-f5e1ad6d020b' },
          { id: 2, crop: 'Rice', farmer: 'KSN-104', region: 'Karnal, Haryana', weight: '25 Quintal', price: 4200, grade: 'A+', rating: 4.8, img: 'photo-1536304929831-ee1ca9d44906' },
        ]);
      }
      setLoading(false);
    };
    fetchMarketplace();
  }, []);

  const filtered = listings.filter(l => {
    const matchesSearch = search === '' || l.crop?.toLowerCase().includes(search.toLowerCase()) || l.region?.toLowerCase().includes(search.toLowerCase());
    const matchesGrades = grades.length === 0 || grades.some(g => l.grade === g);
    const matchesStars = (l.rating || 0) >= minStars;
    const matchesCrops = selectedCrops.length === 0 || selectedCrops.some(c => l.crop === c.value);
    
    return matchesSearch && matchesGrades && matchesStars && matchesCrops;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, grades, minStars, selectedCrops]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedListings = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleGrade = (g: string) => setGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handlePlaceOrder = (item: any) => {
    placeOrder(item);
    setToast({ show: true, message: 'Order placed successfully! Track status in My Orders.' });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  return (
    <main className="bg-gray-50 min-h-[calc(100vh-68px)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-[300px] md:min-w-[300px] bg-white border-r border-gray-200 p-6 flex flex-col gap-8 md:overflow-y-auto">
        <div>
          <h2 className="font-bold text-xl text-gray-900 mb-4">{t('buyer.filters')}</h2>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('buyer.search')}
            className="w-full p-3 text-sm border-2 border-gray-300 rounded-lg outline-none focus:border-green-600 focus:ring-0"
          />
        </div>

        {/* Crop type Multi-select */}
        <div>
          <div className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">{t('buyer.cropType')}</div>
          <Select
            isMulti
            options={cropOptions}
            value={selectedCrops}
            onChange={(selected) => setSelectedCrops(selected as any[])}
            placeholder="Search & select crops..."
            className="text-sm font-semibold text-gray-900"
            classNamePrefix="select"
          />
        </div>

        {/* Quality grade */}
        <div>
          <div className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wider">{t('buyer.qualityGrade')}</div>
          <div className="flex gap-2 flex-wrap">
            {['A+', 'A', 'B'].map(g => (
              <button key={g} onClick={() => toggleGrade(g)}
                className={`px-4 py-2 rounded-lg border-2 font-bold text-sm cursor-pointer transition-colors ${
                  grades.includes(g) ? 'border-green-700 bg-green-50 text-green-800' : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                }`}>
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive 5-Star Rating */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="font-bold text-sm text-gray-700 uppercase tracking-wider">{t('buyer.minRating')}</div>
            {minStars > 0 && (
              <button onClick={() => setMinStars(0)} className="text-xs font-semibold text-green-700 hover:text-green-800">{t('buyer.clear')}</button>
            )}
          </div>
          <div className="flex items-center gap-1.5 group">
            {[1, 2, 3, 4, 5].map(star => (
              <svg 
                key={star} 
                onClick={() => setMinStars(star)}
                className="cursor-pointer transition-transform hover:scale-110"
                width="28" height="28" viewBox="0 0 24 24" 
                fill={star <= minStars ? '#F59E0B' : 'transparent'}
                stroke={star <= minStars ? '#F59E0B' : '#D1D5DB'}
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
            <span className="text-sm font-bold text-gray-700 ml-2">{minStars > 0 ? `${minStars}.0+` : t('buyer.any')}</span>
          </div>
        </div>

        <button onClick={() => { setSearch(''); setGrades(['A']); setMinStars(0); setSelectedCrops([]) }}
          className="p-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors mt-auto">
          {t('buyer.clearAll')}
        </button>
      </aside>

      {/* Main grid */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-bold text-2xl text-gray-900 m-0 flex items-center gap-4">
              {t('buyer.availableListings')}
              <button 
                onClick={() => navigate('/buyer/orders')}
                className="text-sm bg-green-100 text-green-800 hover:bg-green-200 px-4 py-1.5 rounded-lg font-bold transition-colors border border-green-200"
              >
                My Orders
              </button>
            </h1>
            <div className="text-sm text-gray-500 font-semibold mt-1">{filtered.length} {t('buyer.found')}</div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-green-800 font-bold">
            <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-green-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('buyer.loading')}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedListings.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
                {/* Photo */}
                <div className="h-40 bg-green-50 relative overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/${item.img}?w=400&h=200&fit=crop&auto=format`}
                    alt={item.crop}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                    {t('buyer.verifiedBadge')}
                  </span>
                  <span className="absolute top-2.5 right-2.5 bg-green-800 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    Grade {item.grade}
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <h3 className="font-bold text-lg text-gray-900 m-0 leading-tight">{t(item.crop)}</h3>
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">{item.farmer}</span> · {t(item.region)}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <div className="font-extrabold text-2xl text-green-800">₹{item.price.toLocaleString()}<span className="text-xs font-semibold text-gray-500">/q</span></div>
                      <div className="text-xs text-gray-600 font-medium">{item.weight} {t('buyer.available')}</div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200">
                      <span className="text-xs font-bold text-yellow-800">{item.rating}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePlaceOrder(item)}
                    className="mt-auto p-3 bg-green-800 hover:bg-green-700 text-white border-none rounded-xl font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5">
                    {t('buyer.placeOrder')}
                  </button>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex items-center justify-center gap-6 mt-10 mb-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {t('buyer.prevPage')}
                </button>
                <div className="text-sm font-semibold text-gray-600">
                  {t('buyer.page')} <span className="text-gray-900">{currentPage}</span> {t('buyer.of')} <span className="text-gray-900">{totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {t('buyer.nextPage')}
                </button>
              </div>
            )}
          </>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🌾</div>
            <div className="font-bold text-xl text-gray-900">{t('buyer.noMatch')}</div>
            <div className="text-sm mt-2">{t('buyer.tryAdjusting')}</div>
          </div>
        )}
      </div>

      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          {toast.message}
        </div>
      )}
    </main>
  );
}
