import { useState, useEffect } from 'react';
import { getListings, createOrder, createRequest } from '../services/api';
import Select from 'react-select';
import { cropOptions } from '../utils/cropData';

export default function BuyerMarketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [requestForm, setRequestForm] = useState({ buyerId: '', requestedWeight: '', targetPrice: '' });
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [buyerIdForOrder, setBuyerIdForOrder] = useState('2');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await getListings();
      setListings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop) {
      alert("Please select a crop to request.");
      return;
    }
    setRequestLoading(true);
    try {
      await createRequest({
        buyerId: parseInt(requestForm.buyerId),
        cropName: selectedCrop.value,
        requestedWeightQ: parseFloat(requestForm.requestedWeight),
        targetPriceQ: parseFloat(requestForm.targetPrice),
        status: 'OPEN'
      });
      setMessage('Request broadcasted successfully!');
      setRequestForm({ buyerId: '', requestedWeight: '', targetPrice: '' });
      setSelectedCrop(null);
    } catch (err) {
      console.error(err);
      setMessage('Error creating request.');
    } finally {
      setRequestLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleProcure = async (listing: any) => {
    if (!buyerIdForOrder) {
      alert("Please enter a Buyer ID to procure this listing.");
      return;
    }
    setLoading(true);
    try {
      await createOrder({
        farmer: { id: listing.farmerId },
        buyer: { id: parseInt(buyerIdForOrder) },
        cropName: listing.cropName,
        weightQuintals: listing.availableWeightQ,
        status: 'PENDING'
      });
      alert('Procurement successful! Logistics route initialized.');
      fetchListings();
    } catch (err) {
      console.error(err);
      alert('Failed to procure listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Buyer Marketplace</h1>
      
      {message && (
        <div className="mb-6 p-3 bg-blue-100 text-blue-800 rounded-lg text-center font-semibold transition">
          {message}
        </div>
      )}

      {/* Top Section: Broadcast Request */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8 relative z-20">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Broadcast Request</h2>
        <form onSubmit={handleCreateRequest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Buyer ID</label>
            <input type="number" required placeholder="e.g. 2" className="p-[9px] rounded border border-gray-300 w-full outline-none focus:ring-2 focus:ring-blue-500" value={requestForm.buyerId} onChange={e => setRequestForm({...requestForm, buyerId: e.target.value})} />
          </div>
          <div className="relative z-30">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Crop</label>
            <Select
              options={cropOptions}
              value={selectedCrop}
              onChange={setSelectedCrop}
              className="text-gray-700"
              placeholder="Search..."
              isSearchable
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (q)</label>
            <input type="number" required step="0.1" placeholder="e.g. 50" className="p-[9px] rounded border border-gray-300 w-full outline-none focus:ring-2 focus:ring-blue-500" value={requestForm.requestedWeight} onChange={e => setRequestForm({...requestForm, requestedWeight: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Target Price (₹/q)</label>
            <input type="number" required step="0.1" placeholder="e.g. 1500" className="p-[9px] rounded border border-gray-300 w-full outline-none focus:ring-2 focus:ring-blue-500" value={requestForm.targetPrice} onChange={e => setRequestForm({...requestForm, targetPrice: e.target.value})} />
          </div>
          <div>
            <button disabled={requestLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-[9px] rounded transition">
              {requestLoading ? 'Broadcasting...' : 'Broadcast'}
            </button>
          </div>
        </form>
      </div>

      {/* Main Section: Live Listings */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Live Crop Listings</h2>
        <div className="mt-2 sm:mt-0 flex items-center gap-2">
           <label className="text-sm font-semibold text-gray-600">Your Buyer ID:</label>
           <input type="number" placeholder="ID" value={buyerIdForOrder} onChange={e => setBuyerIdForOrder(e.target.value)} className="p-1 px-2 border border-gray-300 rounded w-20 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading marketplace...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{listing.cropName}</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">{listing.status}</span>
                </div>
                <p className="text-gray-500 text-sm mb-1">Farmer ID: #{listing.farmerId}</p>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 font-semibold mb-1">Available Weight</p>
                  <p className="text-lg font-bold text-gray-800">{listing.availableWeightQ} q</p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 font-semibold mb-1">Listing Price</p>
                  <p className="text-2xl font-black text-emerald-600">₹{listing.pricePerQ}<span className="text-sm font-normal text-gray-500">/q</span></p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => handleProcure(listing)} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
                >
                  Place Order
                </button>
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow border border-gray-100">
              <p className="text-gray-500 text-lg">No active listings available at the moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
