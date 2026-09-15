import { useEffect, useState } from 'react';
import { getOrders } from '../services/api';

import { Link } from 'react-router-dom';

export default function BuyerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-blue-800">Buyer Dashboard - AgriLogix</h1>
        <Link 
          to="/buyer/marketplace" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition"
        >
          Browse Listed Items
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Incoming Deliveries</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 uppercase text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Farmer ID</th>
                  <th className="px-4 py-3">Crop</th>
                  <th className="px-4 py-3">Weight (q)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">#{order.id}</td>
                    <td className="px-4 py-3">{order.farmer?.id || '-'}</td>
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
                    <td colSpan={5} className="px-4 py-4 text-center text-gray-500">No incoming deliveries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
