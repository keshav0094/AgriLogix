import { useState } from 'react';
import RouteMap from '../components/RouteMap';
import { triggerOptimization } from '../services/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    dispatchedVehicles: 0,
    totalFleetCostInr: 0,
    unassignedOrders: 0
  });
  const [routes, setRoutes] = useState<any[]>([]);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const data = await triggerOptimization();
      if (data.status === 'success') {
        setMetrics({
          dispatchedVehicles: data.fleetSummary.dispatchedVehicles || 0,
          totalFleetCostInr: data.fleetSummary.totalFleetCostInr || 0,
          unassignedOrders: data.unassignedOrders ? data.unassignedOrders.length : 0
        });
        setRoutes(data.routes || []);
      }
    } catch (err) {
      console.error(err);
      alert('Optimization failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Live Dispatch Dashboard</h1>
        <button 
          onClick={handleOptimize}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition disabled:opacity-50"
        >
          {loading ? 'Optimizing Routes...' : 'Optimize Routes'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Dispatched Trucks</div>
          <div className="text-3xl font-bold text-gray-800">{metrics.dispatchedVehicles}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Fleet Cost (INR)</div>
          <div className="text-3xl font-bold text-gray-800">₹{metrics.totalFleetCostInr.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Capacity Utilization</div>
          <div className="text-3xl font-bold text-emerald-600">{metrics.dispatchedVehicles > 0 ? '85%' : '0%'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Unassigned Orders</div>
          <div className="text-3xl font-bold text-red-500">{metrics.unassignedOrders}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 h-full min-h-[500px]">
          <RouteMap routes={routes} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Route Timeline</h2>
          {routes.length === 0 ? (
            <div className="text-gray-400 text-center mt-10">No active routes. Run optimization.</div>
          ) : (
            <div className="space-y-6">
              {routes.map((route, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3">
                  <div className="font-bold text-emerald-700 mb-2 border-b pb-1">
                    🚚 {route.truckId} (₹{route.dispatchedFixedCost})
                  </div>
                  <ul className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                    {route.stops.map((stop: any, idx: number) => (
                      <li key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="bg-gray-50 border rounded-md p-2 w-full text-sm ml-6">
                          <strong className="block text-gray-700">{stop.step}. {stop.type}</strong>
                          <span className="text-gray-600 block">{stop.name || stop.id}</span>
                          {stop.weight_quintals && <span className="text-xs text-emerald-600 font-medium">Weight: {stop.weight_quintals}q</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
