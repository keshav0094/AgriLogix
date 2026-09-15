import { useState, useEffect } from 'react';
import { getListings, createListing, getRequests, createRequest, createOrder } from '../services/api';

export default function Marketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  
  const [listingForm, setListingForm] = useState({ farmerId: '', cropName: '', weightQuintals: '', pricePerQuintal: '' });
  const [requestForm, setRequestForm] = useState({ buyerId: '', cropName: '', requestedWeight: '', targetPrice: '' });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [buyerIdForOrder, setBuyerIdForOrder] = useState('2');

  const fetchData = async () => {
    try {
      const [listRes, reqRes] = await Promise.all([getListings(), getRequests()]);
      setListings(listRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createListing({
        farmerId: parseInt(listingForm.farmerId),
        cropName: listingForm.cropName,
        weightQuintals: parseFloat(listingForm.weightQuintals),
        pricePerQuintal: parseFloat(listingForm.pricePerQuintal),
        status: 'ACTIVE'
      });
      setMessage('Listing created successfully!');
      setListingForm({ farmerId: '', cropName: '', weightQuintals: '', pricePerQuintal: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage('Error creating listing.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRequest({
        buyerId: parseInt(requestForm.buyerId),
        cropName: requestForm.cropName,
        requestedWeight: parseFloat(requestForm.requestedWeight),
        targetPrice: parseFloat(requestForm.targetPrice),
        status: 'OPEN'
      });
      setMessage('Request created successfully!');
      setRequestForm({ buyerId: '', cropName: '', requestedWeight: '', targetPrice: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage('Error creating request.');
    } finally {
      setLoading(false);
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
        weightQuintals: listing.weightQuintals,
        status: 'PENDING'
      });
      alert('Procurement successful! Route optimization initialized.');
    } catch (err) {
      console.error(err);
      alert('Failed to procure listing. Make sure the database is running and IDs are valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">AgriLogix Live Marketplace</h1>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg text-center font-semibold transition">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Column 1: Farmer Inventory */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-emerald-800 mb-4">Farmer Inventory (Listings)</h2>
          
          <form onSubmit={handleCreateListing} className="bg-emerald-50 p-4 rounded-lg mb-6 border border-emerald-100">
            <h3 className="font-semibold text-emerald-900 mb-3">List New Crop</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="number" required placeholder="Farmer ID" className="p-2 rounded border border-gray-300 w-full" value={listingForm.farmerId} onChange={e => setListingForm({...listingForm, farmerId: e.target.value})} />
              <input type="text" required placeholder="Crop Name" className="p-2 rounded border border-gray-300 w-full" value={listingForm.cropName} onChange={e => setListingForm({...listingForm, cropName: e.target.value})} />
              <input type="number" required step="0.1" placeholder="Weight (q)" className="p-2 rounded border border-gray-300 w-full" value={listingForm.weightQuintals} onChange={e => setListingForm({...listingForm, weightQuintals: e.target.value})} />
              <input type="number" required step="0.1" placeholder="Price (₹/q)" className="p-2 rounded border border-gray-300 w-full" value={listingForm.pricePerQuintal} onChange={e => setListingForm({...listingForm, pricePerQuintal: e.target.value})} />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition">
              {loading ? 'Listing...' : 'List Crop'}
            </button>
          </form>

          <div className="space-y-4">
            {listings.map(l => (
              <div key={l.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{l.cropName} <span className="text-sm font-normal text-gray-500">(Farmer #{l.farmerId})</span></h4>
                    <p className="text-sm text-gray-600 font-semibold">{l.weightQuintals} Quintals • <span className="text-emerald-600 font-bold">₹{l.pricePerQuintal}/q</span></p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">{l.status}</span>
                </div>
                
                <div className="mt-3 flex gap-2 items-center">
                  <input type="number" placeholder="Buyer ID" value={buyerIdForOrder} onChange={e => setBuyerIdForOrder(e.target.value)} className="p-2 text-sm w-24 border border-gray-300 rounded" title="Enter your Buyer ID to procure" />
                  <button onClick={() => handleProcure(l)} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-sm transition">
                    Procure & Dispatch
                  </button>
                </div>
              </div>
            ))}
            {listings.length === 0 && <p className="text-gray-500 text-center py-4">No active listings.</p>}
          </div>
        </div>

        {/* Column 2: Buyer Demand */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Buyer Demand (Requests)</h2>

          <form onSubmit={handleCreateRequest} className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-3">Broadcast Request</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="number" required placeholder="Buyer ID" className="p-2 rounded border border-gray-300 w-full" value={requestForm.buyerId} onChange={e => setRequestForm({...requestForm, buyerId: e.target.value})} />
              <input type="text" required placeholder="Crop Name" className="p-2 rounded border border-gray-300 w-full" value={requestForm.cropName} onChange={e => setRequestForm({...requestForm, cropName: e.target.value})} />
              <input type="number" required step="0.1" placeholder="Weight (q)" className="p-2 rounded border border-gray-300 w-full" value={requestForm.requestedWeight} onChange={e => setRequestForm({...requestForm, requestedWeight: e.target.value})} />
              <input type="number" required step="0.1" placeholder="Target Price (₹/q)" className="p-2 rounded border border-gray-300 w-full" value={requestForm.targetPrice} onChange={e => setRequestForm({...requestForm, targetPrice: e.target.value})} />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition">
              {loading ? 'Broadcasting...' : 'Broadcast Request'}
            </button>
          </form>

          <div className="space-y-4">
            {requests.map(r => (
              <div key={r.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{r.cropName} <span className="text-sm font-normal text-gray-500">(Buyer #{r.buyerId})</span></h4>
                    <p className="text-sm text-gray-600 font-semibold">{r.requestedWeight} Quintals Required</p>
                    <p className="text-sm text-blue-600 font-bold mt-1">Target: ₹{r.targetPrice}/q</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">{r.status}</span>
                </div>
              </div>
            ))}
            {requests.length === 0 && <p className="text-gray-500 text-center py-4">No open requests.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
