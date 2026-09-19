import { useState, useEffect } from 'react';
import { getPriceForecast, getCrops, getRegions } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Select from 'react-select';
import { useLanguage } from '../contexts/LanguageContext';

export function FarmerDashboard() {
  const { t } = useLanguage();
  const [cropOptions, setCropOptions] = useState<{label: string, value: string, isMsp: boolean}[]>([]);
  const [regionOptions, setRegionOptions] = useState<{label: string, value: string}[]>([]);
  
  const [selectedCrop, setSelectedCrop] = useState<{label: string, value: string, isMsp: boolean} | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<{label: string, value: string} | null>(null);
  
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [predictedPrice, setPredictedPrice] = useState(0);
  const [bestSellWindow, setBestSellWindow] = useState('');
  const [msp, setMsp] = useState<string | number>('');
  const [historicalBaseline, setHistoricalBaseline] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isNewListingOpen, setIsNewListingOpen] = useState(false);
  const [viewListingId, setViewListingId] = useState<string | null>(null);

  const initialListings = [
    { id: 'AG-2024-0891', crop: 'Wheat', qty: '12 Quintal', grade: 'A', price: '₹2,510/q', status: 'Active', bids: 4, listed: '17 Sep 2026' },
    { id: 'AG-2024-0756', crop: 'Rice (Basmati)', qty: '8 Quintal', grade: 'A+', price: '₹4,200/q', status: 'Bid Received', bids: 7, listed: '14 Sep 2026' },
    { id: 'AG-2024-0712', crop: 'Soybean', qty: '20 Quintal', grade: 'B', price: '₹3,100/q', status: 'In Transit', bids: 1, listed: '10 Sep 2026' },
  ];
  const [listings, setListings] = useState(initialListings);

  // 1. Initial Load: Fetch Crops from DB
  useEffect(() => {
    const fetchInitialCrops = async () => {
      try {
        const res = await getCrops();
        if (res?.data?.data) {
          const crops: string[] = res.data.data;
          // Note: Since DB just returns string, we format label and value the same.
          // In a real app we'd fetch boolean MSP flag from DB too, but we'll assume isMsp logic from python.
          const formattedCrops = crops.map(c => ({ label: t(c), value: c, isMsp: true }));
          setCropOptions(formattedCrops);
          if (formattedCrops.length > 0) {
            setSelectedCrop(formattedCrops[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load crops from DB", err);
      }
    };
    fetchInitialCrops();
  }, []);

  // 2. Dependent Dropdown: Fetch Regions based on Selected Crop
  useEffect(() => {
    const fetchDependentRegions = async () => {
      if (!selectedCrop) return;
      setRegionsLoading(true);
      setSelectedRegion(null); // Clear selected region
      try {
        const res = await getRegions(selectedCrop.value);
        if (res?.data?.data) {
          const regions: string[] = res.data.data;
          const formattedRegions = regions.map(r => ({ label: t(r), value: r }));
          setRegionOptions(formattedRegions);
          if (formattedRegions.length > 0) {
            setSelectedRegion(formattedRegions[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load dependent regions", err);
      }
      setRegionsLoading(false);
    };
    fetchDependentRegions();
  }, [selectedCrop]);

  const fetchForecast = async () => {
    if (!selectedCrop || !selectedRegion) return;
    setLoading(true);
    try {
      const response = await getPriceForecast({ crop: selectedCrop.value, region: selectedRegion.value });
      
      if (response?.data?.data?.forecast_7_days && response.data.data.forecast_7_days.length > 0) {
        const data = response.data.data;
        setForecastData(data.forecast_7_days);
        setPredictedPrice(data.recommended_price || data.forecast_7_days[data.forecast_7_days.length-1].predicted_price);
        setBestSellWindow(data.best_sell_window || 'N/A');
        setMsp(data.msp || 'N/A (Market Driven)');
        setHistoricalBaseline(data.historical_baseline || 0);
      }
    } catch (err) {
      console.error("Failed to fetch forecast from AI Engine", err);
    }
    setLoading(false);
  };

  // 3. Auto-fetch forecast when both crop and region are selected and locked in
  useEffect(() => {
    if (selectedCrop && selectedRegion) {
      fetchForecast();
    }
  }, [selectedCrop, selectedRegion]);

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const newL = {
      id: `AG-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      crop: fd.get('crop') as string,
      qty: `${fd.get('qty')} Quintal`,
      grade: fd.get('grade') as string,
      price: `₹${fd.get('price')}/q`,
      status: 'Active',
      bids: 0,
      listed: '19 Sep 2026'
    };
    setListings([newL, ...listings]);
    setIsNewListingOpen(false);
    // Simple toast replacement
    alert(`Success! Listing ${newL.id} has been published.`);
  };

  const handleAcceptBid = (id: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'In Transit' } : l));
    setViewListingId(null);
    alert(`Success! Bid accepted for ${id}. Transport assigned.`);
  };

  const statusColor: Record<string, string> = {
    'Active': 'bg-green-100 text-green-800',
    'Bid Received': 'bg-yellow-100 text-yellow-800',
    'In Transit': 'bg-blue-100 text-blue-800',
  };

  return (
    <main className="bg-gray-50 min-h-[calc(100vh-68px)]">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 py-5 px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500 font-medium mb-1">{t('farmer.welcome')}</div>
            <h1 className="font-extrabold text-2xl md:text-3xl text-gray-900 m-0 flex items-center gap-3">
              Ramesh Kumar Yadav
              <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">{t('farmer.verified')}</span>
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs md:text-sm text-gray-500">{t('farmer.address')}</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">{t('farmer.farmerId')}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-8">

        {/* AI Price Predictor panel */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-green-800 py-4 px-6 md:px-8 flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 18l5-8 4 5 3-4 6 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="19" cy="5" r="3" fill="#FCD34D"/>
            </svg>
            <h2 className="font-bold text-xl text-white m-0">{t('farmer.aiTitle')}</h2>
          </div>

          <div className="p-6 md:p-8">
            {/* Controls row */}
            <div className="flex flex-wrap gap-5 mb-8 items-end">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('farmer.selectCrop')}</label>
                <Select
                  value={selectedCrop}
                  onChange={(option) => { if (option) setSelectedCrop(option) }}
                  options={cropOptions}
                  isLoading={cropOptions.length === 0}
                  placeholder={t('farmer.loadingCrops')}
                  className="text-base font-semibold text-gray-900"
                  classNamePrefix="select"
                  isSearchable
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('farmer.selectRegion')}</label>
                <Select
                  value={selectedRegion}
                  onChange={(option) => { if (option) setSelectedRegion(option) }}
                  options={regionOptions}
                  isLoading={regionsLoading}
                  isDisabled={regionsLoading || !selectedCrop}
                  placeholder={regionsLoading ? t('farmer.fetchingMandis') : t('farmer.selectMandi')}
                  className="text-base font-semibold text-gray-900"
                  classNamePrefix="select"
                  isSearchable
                />
              </div>
              <button onClick={fetchForecast} disabled={loading || !selectedCrop || !selectedRegion}
                className="p-[11px] px-8 bg-green-800 hover:bg-green-700 text-white border-none rounded-md font-bold text-base shadow-md transition-colors whitespace-nowrap disabled:opacity-50 h-[42px]">
                {loading ? t('farmer.computing') : t('farmer.train')}
              </button>
            </div>

            {/* Chart + summary side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
              <div className="border border-gray-200 rounded-xl p-5 pt-4 bg-white h-[320px]">
                <div className="text-sm font-semibold text-gray-700 mb-4">
                  {t('farmer.trend')} — {selectedCrop?.label || '...'} · {selectedRegion?.label || '...'}
                </div>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E6B3C" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#1E6B3C" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#111827' }} />
                      <Area type="monotone" dataKey="predicted_price" stroke="#1E6B3C" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right: price summary + CTA */}
              <div className="flex flex-col gap-4">
                <div className="bg-green-50 border border-green-300 rounded-xl p-5">
                  <div className="text-sm font-semibold text-green-800 mb-1">{t('farmer.aiRecPrice')}</div>
                  <div className="font-extrabold text-4xl text-green-700">₹{predictedPrice}<span className="text-lg font-bold">/q</span></div>
                  <div className="text-sm text-green-700 mt-2 font-medium">
                    {predictedPrice > historicalBaseline ? `+₹${predictedPrice - historicalBaseline} ${t('farmer.vsToday')}` : `-₹${historicalBaseline - predictedPrice} ${t('farmer.vsToday')}`}
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-xs font-bold text-yellow-800 uppercase tracking-wide">{t('farmer.bestSellWindow')}</div>
                  <div className="font-bold text-yellow-900 text-sm md:text-base mt-1">{bestSellWindow}</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs font-bold text-blue-800 uppercase tracking-wide">{t('farmer.msp')}</div>
                  <div className="font-bold text-blue-900 text-sm md:text-base mt-1">
                    {typeof msp === 'number' ? `₹${msp} / Quintal` : (msp === 'N/A (Market Driven)' ? t('farmer.mspMarketDriven') : msp)}
                  </div>
                </div>
                
                <button onClick={() => setIsNewListingOpen(true)} className="mt-auto p-4 bg-green-800 hover:bg-green-700 text-white rounded-xl font-extrabold text-lg shadow-lg leading-snug transition-transform hover:-translate-y-0.5 whitespace-pre-line">
                  {t('farmer.listBtn')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Active Listings table */}
        <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-5 md:px-8 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-bold text-xl text-gray-900 m-0">{t('farmer.activeListings')}</h2>
            <button onClick={() => setIsNewListingOpen(true)} className="py-2 px-5 bg-green-50 text-green-800 border border-green-300 rounded-lg font-bold text-sm hover:bg-green-100 transition-colors">
              {t('farmer.newListingBtn')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-bold border-b-2 border-gray-200">
                <tr>
                  {[t('farmer.col.id'), t('farmer.col.crop'), t('farmer.col.qty'), t('farmer.col.grade'), t('farmer.col.price'), t('farmer.col.bids'), t('farmer.col.status'), t('farmer.col.listed'), t('farmer.col.action')].map(h => (
                    <th key={h} className="py-3 px-4 md:px-6 whitespace-nowrap uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((r, i) => (
                  <tr key={r.id} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="py-3.5 px-4 md:px-6 font-mono font-bold text-green-800 text-xs">{r.id}</td>
                    <td className="py-3.5 px-4 md:px-6 font-bold">{t(r.crop)}</td>
                    <td className="py-3.5 px-4 md:px-6 text-gray-700">{r.qty}</td>
                    <td className="py-3.5 px-4 md:px-6">
                      <span className="bg-green-100 text-green-800 font-bold text-xs px-2.5 py-1 rounded-full">Grade {r.grade}</span>
                    </td>
                    <td className="py-3.5 px-4 md:px-6 font-bold text-gray-900">{r.price}</td>
                    <td className={`py-3.5 px-4 md:px-6 font-bold text-center ${r.bids >= 4 ? 'text-green-700' : 'text-gray-600'}`}>{r.bids}</td>
                    <td className="py-3.5 px-4 md:px-6">
                      <span className={`${statusColor[r.status]} font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap`}>{r.status}</span>
                    </td>
                    <td className="py-3.5 px-4 md:px-6 text-gray-500">{r.listed}</td>
                    <td className="py-3.5 px-4 md:px-6">
                      <button onClick={() => setViewListingId(r.id)} className="py-1.5 px-4 bg-green-800 text-white rounded-md font-semibold text-xs hover:bg-green-700 transition-colors">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {/* NEW LISTING MODAL */}
      {isNewListingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setIsNewListingOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-green-800 text-white p-4">
              <h2 className="font-bold text-lg m-0">Create New Listing</h2>
            </div>
            <form onSubmit={handleCreateListing} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Crop</label>
                <select name="crop" required defaultValue="" className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white">
                  {cropOptions.length === 0 ? (
                    <option value="" disabled>Loading DB Crops...</option>
                  ) : (
                    <>
                      <option value="" disabled>Select Crop...</option>
                      {cropOptions.map((crop, index) => (
                        <option key={index} value={crop.value}>{crop.label}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity (Quintals)</label>
                <input name="qty" type="number" required min="1" className="w-full border border-gray-300 rounded-lg p-2 text-gray-900" placeholder="e.g. 50" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Grade</label>
                <select name="grade" required className="w-full border border-gray-300 rounded-lg p-2 text-gray-900 bg-white">
                  <option value="A+">Grade A+</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Minimum Base Price (₹/q)</label>
                <input name="price" type="number" required min="100" defaultValue={predictedPrice || ''} className="w-full border border-gray-300 rounded-lg p-2 text-gray-900" placeholder="e.g. 2500" />
              </div>
              
              <div className="mt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsNewListingOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold rounded-lg hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg shadow">Publish Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW LISTING MODAL */}
      {viewListingId && (() => {
        const listing = listings.find(l => l.id === viewListingId);
        if (!listing) return null;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setViewListingId(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-gray-50 border-b border-gray-200 p-5 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-xl text-gray-900 m-0">{listing.crop}</h2>
                  <div className="text-sm text-gray-500 font-mono mt-0.5">ID: {listing.id}</div>
                </div>
                <span className={`${statusColor[listing.status] || 'bg-gray-100 text-gray-800'} font-bold text-xs px-3 py-1 rounded-full`}>{listing.status}</span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Quantity</div>
                    <div className="font-semibold text-gray-900">{listing.qty}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Grade</div>
                    <div className="font-semibold text-gray-900">{listing.grade}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Listed Price</div>
                    <div className="font-semibold text-gray-900">{listing.price}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">Listed On</div>
                    <div className="font-semibold text-gray-900">{listing.listed}</div>
                  </div>
                </div>
                
                <hr className="border-gray-200 mb-6" />
                
                <h3 className="font-bold text-lg text-gray-900 mb-4">Live Bids ({listing.bids})</h3>
                
                {listing.bids > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-green-900">Buyer: ITC ITC-A2</div>
                        <div className="text-xs text-green-700">Highest Bid</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-lg text-green-800">₹{parseInt(listing.price.replace(/\D/g, '')) + 45}/q</div>
                      </div>
                    </div>
                    {listing.bids > 1 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex justify-between items-center opacity-70">
                        <div>
                          <div className="font-semibold text-gray-700">Buyer: Local Mandi KSN</div>
                        </div>
                        <div className="text-right font-bold text-gray-700">
                           ₹{parseInt(listing.price.replace(/\D/g, '')) - 20}/q
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    No bids received yet.
                  </div>
                )}
                
                <div className="mt-8 flex justify-end gap-3">
                  <button onClick={() => setViewListingId(null)} className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors">Close</button>
                  {listing.status !== 'In Transit' && listing.status !== 'Sold' && listing.bids > 0 && (
                     <button onClick={() => handleAcceptBid(listing.id)} className="px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-lg shadow-md transition-transform hover:-translate-y-0.5">Accept Highest Bid</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}