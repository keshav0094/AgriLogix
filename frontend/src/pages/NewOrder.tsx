import { useState } from 'react';
import { createOrder } from '../services/api';

export default function NewOrder() {
  const [formData, setFormData] = useState({
    farmerId: '',
    buyerId: '',
    cropName: '',
    weightQuintals: ''
  });
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    const orderPayload = {
      farmer: { id: parseInt(formData.farmerId) },
      buyer: { id: parseInt(formData.buyerId) },
      cropName: formData.cropName,
      weightQuintals: parseFloat(formData.weightQuintals),
      status: 'PENDING'
    };

    try {
      await createOrder(orderPayload);
      setStatus({ type: 'success', message: 'Order submitted to AgriLogix network!' });
      setFormData({ farmerId: '', buyerId: '', cropName: '', weightQuintals: '' });
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to submit order. Check connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-emerald-800">New Order (Farmer) - AgriLogix</h1>
      
      {status.type === 'success' && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-sm">
          {status.message}
        </div>
      )}

      {status.type === 'error' && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Farmer ID</label>
            <input 
              type="number"
              required
              value={formData.farmerId}
              onChange={(e) => setFormData({...formData, farmerId: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              placeholder="e.g. 1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Buyer ID</label>
            <input 
              type="number"
              required
              value={formData.buyerId}
              onChange={(e) => setFormData({...formData, buyerId: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              placeholder="e.g. 2"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Crop Name</label>
          <input 
            type="text"
            required
            value={formData.cropName}
            onChange={(e) => setFormData({...formData, cropName: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            placeholder="e.g. Potato, Wheat, Onion"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (Quintals)</label>
          <input 
            type="number"
            step="0.1"
            required
            value={formData.weightQuintals}
            onChange={(e) => setFormData({...formData, weightQuintals: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            placeholder="e.g. 15.5"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Order to AgriLogix'}
        </button>
      </form>
    </div>
  );
}
