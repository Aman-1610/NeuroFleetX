import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in Vite/Webpack builds
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map view when center changes
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || 13, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
};

const RouteMap = ({ routes, start, end, height = '450px' }) => {
    const defaultCenter = [28.6139, 77.2090]; // New Delhi
    const center = start || defaultCenter;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <MapContainer
                center={center}
                zoom={12}
                style={{ height: height, width: '100%' }}
            >
                <ChangeView center={start || defaultCenter} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {start && <Marker position={start}><Popup>Start Location</Popup></Marker>}
                {end && <Marker position={end}><Popup>Destination</Popup></Marker>}

                {routes && routes.map((route, idx) => (
                    <Polyline
                        key={route.id || idx}
                        positions={route.path}
                        color={route.color || '#3b82f6'}
                        weight={6}
                        opacity={0.8}
                    >
                        <Popup>
                            <div style={{ color: '#333' }}>
                                <h3 style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>{route.type}</h3>
                                <p style={{ margin: 0 }}>ETA: {route.eta}</p>
                                <p style={{ margin: 0 }}>Distance: {route.distance}</p>
                                <p style={{ margin: 0 }}>Traffic: {route.trafficCondition}</p>
                            </div>
                        </Popup>
                    </Polyline>
                ))}
            </MapContainer>
        </div>
    );
};

export default RouteMap;
