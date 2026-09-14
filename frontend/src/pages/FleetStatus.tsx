import { useEffect, useState } from 'react';
import { getVehicles } from '../services/api';

export default function FleetStatus() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicles()
      .then((res) => {
        setVehicles(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-emerald-800">AgriLogix Fleet Status</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 uppercase text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Vehicle ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Capacity (q)</th>
                <th className="px-6 py-4">Fixed Cost (₹)</th>
                <th className="px-6 py-4">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vehicles.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">#{v.id}</td>
                  <td className="px-6 py-4">{v.type}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">{v.capacityQuintals}</td>
                  <td className="px-6 py-4">₹{v.fixedCost}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      v.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {v.isAvailable ? 'Available' : 'In-Transit'}
                    </span>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No vehicles found in AgriLogix fleet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
