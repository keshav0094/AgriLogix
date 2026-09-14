import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const icons = {
  DEPOT: createIcon('black'),
  PICKUP: createIcon('green'),
  DELIVERY: createIcon('blue')
};

interface Stop {
  step: number;
  type: string;
  id?: string;
  name?: string;
  crop?: string;
  weight_quintals?: number;
  coords: [number, number];
}

interface RouteProps {
  routes: Array<{
    truckId: string;
    pathCoords: [number, number][];
    stops: Stop[];
  }>;
}

export default function RouteMap({ routes }: RouteProps) {
  const center: [number, number] = [28.9, 77.0]; // Haryana/Delhi

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-300 shadow-inner">
      <MapContainer center={center} zoom={9} style={{ height: '100%', width: '100%', minHeight: '500px' }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {routes.map((route, routeIdx) => (
          <React.Fragment key={route.truckId + routeIdx}>
            {route.pathCoords && route.pathCoords.length > 0 && (
              <Polyline positions={route.pathCoords} color="#059669" weight={4} opacity={0.7} />
            )}
            
            {route.stops.map((stop, stopIdx) => {
              const icon = icons[stop.type as keyof typeof icons] || icons.DEPOT;
              return (
                <Marker key={`${route.truckId}-${stopIdx}`} position={stop.coords as [number, number]} icon={icon}>
                  <Popup>
                    <div className="p-1">
                      <strong className="block text-sm mb-1">{stop.step}. {stop.type}</strong>
                      {stop.name && <div className="text-xs"><b>Name:</b> {stop.name}</div>}
                      {stop.crop && <div className="text-xs"><b>Crop:</b> {stop.crop}</div>}
                      {stop.weight_quintals && <div className="text-xs"><b>Weight:</b> {stop.weight_quintals} quintals</div>}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
}
