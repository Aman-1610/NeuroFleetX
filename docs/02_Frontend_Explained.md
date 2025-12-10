# Frontend Code Walkthrough: `ProfileCard.jsx` (Using OpenStreetMap)

This file handles the display and editing of the user's profile. Here is a line-by-line breakdown of how it works.

## 1. Imports
```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ... } from 'lucide-react';
// Changed from Google Maps to Leaflet (Open Source Map)
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
```
- **`MapContainer`, `TileLayer`**: The main components from `react-leaflet` to display the map.
- **`leaflet.css`**: REQUIRED for the map to render correctly (otherwise tiles look broken).

## 2. API Key? None Needed!
We switched to **OpenStreetMap** which is free and open source. It does not require an API key for basic usage, so we removed the `GOOGLE_MAPS_API_KEY` logic. This solves the "Development Only" watermark issue.

## 3. Component Setup & State
```javascript
const ProfileCard = ({ user, onClose, onUpdate, isFullPage = false }) => {
    // ...
    const [currentLocation, setCurrentLocation] = useState(null); 
    // ...
```
- **`currentLocation`**: Stores `{ lat: 20.59, lng: 78.96 }`. If null, the map defaults to India's center.

## 4. Helper Component: `<RecenterMap />`
Leaflet maps don't automatically "fly to" a new location if you just format the props. We need a helper:
```javascript
const RecenterMap = ({ center }) => {
    const map = useMap(); // Access the internal Leaflet instance
    useEffect(() => {
        if (center) {
            map.setView(center, 15); // Programmatically zoom to new point
        }
    }, [center, map]);
    return null; // Renders nothing visible
};
```

## 5. Render Functions: `renderAddress`
```javascript
const renderAddress = () => (
    <div className="profile-section">
        {/* ... Address Inputs ... */}

        {/* The Map */}
        <div className="map-container">
            <MapContainer center={...} zoom={5}>
                {/* The Visual Tiles (Skin of the map) */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="..."
                />
                
                {/* The Pin */}
                {currentLocation && (
                    <Marker position={currentLocation}>
                        <Popup>Your Location</Popup>
                    </Marker>
                )}
                
                {/* The Auto-Mover */}
                <RecenterMap center={currentLocation} />
            </MapContainer>
        </div>
    </div>
);
```

## 6. Geolocation Logic
```javascript
const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
         // Same logic as before, works nicely with Leaflet
         setCurrentLocation({
             lat: position.coords.latitude,
             lng: position.coords.longitude
         });
    });
};
```

## Why Leaflet?
1.  **Free**: No credit card required.
2.  **Open Source**: No "Development Only" watermarks.
3.  **Lightweight**: Faster to load than the full Google Maps bundle.
