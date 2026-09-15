import { useState, useEffect } from 'react';
import { createOrder, getOrders } from '../services/api';
import ForecastWidget from '../components/ForecastWidget';

export default function FarmerDashboard() {
  const [formData, setFormData] = useState({
    farmerId: '',
    buyerId: '',
    cropName: '',
    weightQuintals: ''
  });
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchOrders = () => {
    setOrdersLoading(true);
    getOrders()
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setOrdersLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
      fetchOrders(); // Instantly update the table
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Failed to submit order. Check connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-emerald-800">Farmer Dashboard - AgriLogix</h1>
      
      <ForecastWidget />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Submit New Order</h2>
            {status.type === 'success' && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {status.message}
              </div>
            )}
            {status.type === 'error' && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Farmer ID</label>
                <input 
                  type="number" required value={formData.farmerId}
                  onChange={(e) => setFormData({...formData, farmerId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Buyer ID</label>
                <input 
                  type="number" required value={formData.buyerId}
                  onChange={(e) => setFormData({...formData, buyerId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Crop Name</label>
                <input 
                  type="text" required value={formData.cropName}
                  onChange={(e) => setFormData({...formData, cropName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Potato"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (Quintals)</label>
                <input 
                  type="number" step="0.1" required value={formData.weightQuintals}
                  onChange={(e) => setFormData({...formData, weightQuintals: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 15.5"
                />
              </div>
              <button 
                type="submit" disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Orders Table Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Orders</h2>
            {ordersLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 uppercase text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Buyer ID</th>
                      <th className="px-4 py-3">Crop</th>
                      <th className="px-4 py-3">Weight (q)</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">#{order.id}</td>
                        <td className="px-4 py-3">{order.buyer?.id || '-'}</td>
                        <td className="px-4 py-3">{order.cropName}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">{order.weightQuintals}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-4 text-center text-gray-500">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
