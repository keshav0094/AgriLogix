import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../contexts/LanguageContext';

// Custom icons
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Regions Config
const regions = [
  { name: 'Delhi NCR Corridor', latRange: [28.2, 29.0], lngRange: [76.8, 77.6], pinBase: 110000, drops: 3 },
  { name: 'Haryana Corridor', latRange: [28.5, 29.5], lngRange: [75.5, 76.5], pinBase: 120000, drops: 4 },
  { name: 'Punjab Corridor', latRange: [30.5, 31.5], lngRange: [74.5, 76.0], pinBase: 140000, drops: 3 },
  { name: 'Rajasthan Corridor', latRange: [26.0, 28.0], lngRange: [73.5, 75.5], pinBase: 302000, drops: 4 },
  { name: 'Mumbai/Pune Corridor', latRange: [18.5, 19.3], lngRange: [72.9, 74.0], pinBase: 400000, drops: 3 },
  { name: 'Karnataka Corridor', latRange: [14.5, 16.0], lngRange: [74.8, 76.5], pinBase: 560000, drops: 3 },
  { name: 'Bihar Corridor', latRange: [24.5, 25.5], lngRange: [84.5, 86.0], pinBase: 800000, drops: 4 },
  { name: 'Manipur Corridor', latRange: [24.0, 25.0], lngRange: [93.5, 94.5], pinBase: 795000, drops: 3 },
];

import { getOrders, triggerOptimization } from '../services/api';

function MapController({ setZoom }: { setZoom: (z: number) => void }) {
  useMapEvents({
    zoom: (e) => setZoom(e.target.getZoom()),
  });
  return null;
}

export function AdminDispatch() {
  const { t } = useLanguage();
  const [nodes, setNodes] = useState<any[]>([]);
  const [corridors, setCorridors] = useState<any[]>([]);
  const [expandedCorridorId, setExpandedCorridorId] = useState<string | null>(null);
  const [optimized, setOptimized] = useState(false);
  const [running, setRunning] = useState(false);
  const [mapZoom, setMapZoom] = useState(5);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await getOrders();
        if (response?.data) {
          const orders = response.data;
          // Map backend orders to our nodes format for UI
          const fetchedNodes: any[] = [];
          orders.forEach((order: any) => {
            // Pickups
            if (order.farmer) {
              fetchedNodes.push({
                id: `NODE-F-${order.id}`,
                corridor: 'Assigned',
                type: 'pickup',
                lat: order.farmer.lat,
                lng: order.farmer.lng,
                displayId: order.farmer.name || `Farmer ${order.id}`,
                pinCode: '000000',
                load: order.weightQuintals
              });
            }
            // Drops (Buyers)
            if (order.buyer) {
              fetchedNodes.push({
                id: `NODE-B-${order.id}`,
                corridor: 'Assigned',
                type: 'drop',
                lat: order.buyer.lat,
                lng: order.buyer.lng,
                displayId: order.buyer.name || `Buyer ${order.id}`,
                pinCode: '000000',
                load: 0
              });
            }
          });

          // Deduplicate nodes based on displayId
          const uniqueNodes = fetchedNodes.filter((v, i, a) => a.findIndex(t => (t.displayId === v.displayId)) === i);
          setNodes(uniqueNodes);
        }
      } catch (err) {
        console.error("Failed to load orders");
      }
    };
    fetchNodes();
  }, []);

  const handleOptimize = async () => {
    setRunning(true);
    try {
      const response = await triggerOptimization();

      if (response && response.routes) {
        const calculatedCorridors: any[] = response.routes.map((route: any) => {
          // Map AiRoutingResponse.Route to corridor state

          const sequence = route.stops ? route.stops.map((stop: any, index: number) => ({
            id: `${stop.id}-${index}`,
            type: stop.type === 'pickup' ? 'pickup' : 'drop',
            action: stop.type === 'pickup' ? 'pickup' : 'dropoff',
            load: stop.weight_quintals || 0,
            offloadAmount: stop.type === 'drop' ? stop.weight_quintals : 0,
            displayId: stop.name || stop.id,
            pinCode: '000000',
            lat: stop.coords[0],
            lng: stop.coords[1]
          })) : [];

          const pickups = sequence.filter((s: any) => s.type === 'pickup');
          const drops = sequence.filter((s: any) => s.type === 'drop');

          const totalLoad = pickups.reduce((acc: number, curr: any) => acc + curr.load, 0);

          return {
            id: route.truckId,
            name: `Truck ${route.truckId}`,
            totalPickups: pickups.length,
            totalDrops: drops.length,
            totalLoad: totalLoad,
            sequence: sequence,
            routePath: route.pathCoords || [],
            estDistance: `Cost: ₹${route.dispatchedFixedCost || 0}`
          };
        });

        setCorridors(calculatedCorridors);
        setOptimized(true);

        if (calculatedCorridors.length > 0) {
          setExpandedCorridorId(calculatedCorridors[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to optimize routes", e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="bg-gray-50 min-h-[calc(100vh-68px)] flex flex-col md:flex-row">
      {/* Left panel */}
      <aside className="w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-68px)]">
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <button
            onClick={handleOptimize}
            disabled={running || optimized}
            className={`w-full py-3 px-4 rounded-xl font-bold text-white shadow-md transition-all ${optimized ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} disabled:opacity-70`}
          >
            {running ? t('admin.optimizing') : optimized ? t('admin.optimized') : t('admin.optimize')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!optimized && !running && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-bold text-gray-700 mb-2">{nodes.length} {t('admin.nodesDiscovered')}</h3>
              <p className="text-sm text-gray-500">{t('admin.waitingText')}</p>
            </div>
          )}

          {optimized && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-lg text-gray-900 m-0">{t('admin.optCorridors')}</h2>
                <span className="bg-green-100 text-green-800 font-bold text-xs px-2.5 py-1 rounded-full">{corridors.length} {t('admin.active')}</span>
              </div>

              {corridors.map(corridor => {
                const isExpanded = expandedCorridorId === corridor.id;

                return (
                  <div key={corridor.id} className={`border-2 rounded-xl transition-all ${isExpanded ? 'border-emerald-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                    {/* Accordion Header */}
                    <div
                      className={`p-4 cursor-pointer flex flex-col gap-2 ${isExpanded ? 'bg-emerald-50 rounded-t-lg' : 'bg-white rounded-xl'}`}
                      onClick={() => setExpandedCorridorId(isExpanded ? null : corridor.id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">{corridor.name}</span>
                        <span className="text-xs font-bold text-gray-500">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-600 font-medium">
                        <span>{corridor.totalPickups} {t('admin.pickups')} · {corridor.totalDrops} {t('admin.drops')}</span>
                        <span className="bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">{corridor.estDistance}</span>
                      </div>
                      <div className="text-sm font-bold text-emerald-700">{t('admin.totalLoad')}: {corridor.totalLoad} {t('admin.quintals')}</div>
                    </div>

                    {/* Accordion Body (Stepper) */}
                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-emerald-100 rounded-b-xl max-h-[350px] overflow-y-auto">
                        <div className="relative border-l-2 border-emerald-200 ml-3 pl-5 space-y-5 py-2">
                          {corridor.sequence.map((step: any, idx: number) => (
                            <div key={step.id} className="relative">
                              <div className={`absolute -left-[27px] top-0 w-3 h-3 rounded-full border-2 border-white ${step.type === 'drop' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                              <div className="text-xs font-bold text-gray-500 mb-0.5">{t('admin.step')} {idx + 1}</div>
                              <div className="text-sm font-bold text-gray-900">
                                {step.action === 'dropoff'
                                  ? `${t('admin.deliver')} ${step.offloadAmount} ${t('admin.quintals')} ${t('admin.to')} ${step.displayId} (${t('admin.currentLoad')}: 0)`
                                  : `${t('admin.pickupFrom')} ${step.displayId} (${step.load} ${t('admin.quintals')})`}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">{t('admin.pin')}: <span className="font-mono">{step.pinCode}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Map area */}
      <div className="flex-1 relative bg-blue-50 z-0 h-[50vh] md:h-auto">
        <MapContainer center={[22.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <MapController setZoom={setMapZoom} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Always render all markers */}
          {nodes.map(n => {
            const isExpanded = n.corridor === expandedCorridorId;
            const small = mapZoom < 7 && !isExpanded;

            const iconSize: [number, number] = small ? [15, 25] : [25, 41];
            const iconAnchor: [number, number] = small ? [7, 25] : [12, 41];
            const popupAnchor: [number, number] = small ? [1, -20] : [1, -34];
            const shadowSize: [number, number] = small ? [25, 25] : [41, 41];
            const opacity = small ? 0.6 : 1.0;

            const dynamicIcon = new L.Icon({
              iconUrl: n.type === 'drop' ? redIcon.options.iconUrl : blueIcon.options.iconUrl,
              shadowUrl: blueIcon.options.shadowUrl,
              iconSize,
              iconAnchor,
              popupAnchor,
              shadowSize
            });

            return (
              <Marker
                key={n.id}
                position={[n.lat, n.lng]}
                icon={dynamicIcon}
                opacity={opacity}
                zIndexOffset={isExpanded ? 1000 : 0}
              >
                <Popup>
                  <div className="font-bold text-sm">{n.displayId}</div>
                  <div className="text-xs text-gray-600 mt-1">{t('admin.pin')}: {n.pinCode}</div>
                  <div className="text-xs font-semibold text-gray-800 mt-1">{t('admin.type')}: {n.type === 'drop' ? t('admin.hubMandi') : t('admin.farmerPickup')}</div>
                  {n.type === 'pickup' && <div className="text-xs text-blue-700 font-bold mt-1">{t('admin.load')}: {n.load} {t('admin.quintals')}</div>}
                </Popup>
              </Marker>
            );
          })}

          {/* Conditionally render polyline for the expanded corridor only */}
          {optimized && expandedCorridorId && corridors.find(c => c.id === expandedCorridorId) && (() => {
            const activeCorridor = corridors.find(c => c.id === expandedCorridorId);
            const pts = activeCorridor.routePath;
            const isValid = pts && Array.isArray(pts) && pts.length >= 2 && pts.every((pt: any) => Array.isArray(pt) && pt.length >= 2 && typeof pt[0] === 'number' && typeof pt[1] === 'number');
            if (!isValid) return null;

            return (
              <Polyline
                positions={pts as [number, number][]}
                color="#059669" // Emerald green
                weight={4}
                opacity={0.9}
                dashArray="5, 10"
              />
            );
          })()}

        </MapContainer>

        {/* Floating status */}
        <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('admin.netStatus')}</div>
          <div className="flex items-center gap-2">
            {running ? (
              <><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-ping"></span><span className="text-sm font-semibold text-gray-900">{t('admin.calcOpt')}</span></>
            ) : optimized ? (
              <><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span><span className="text-sm font-semibold text-green-700">68 {t('admin.successRouted')}</span></>
            ) : (
              <><span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span><span className="text-sm font-semibold text-gray-900">{t('admin.awaitingOpt')}</span></>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
