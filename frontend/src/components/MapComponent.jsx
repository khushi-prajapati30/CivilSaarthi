import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapEvents = ({ setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            });
        },
    });
    return null;
};

const MapComponent = ({ position, setPosition, readonly = false }) => {
    const defaultPosition = [20.5937, 78.9629]; // Center of India

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-700 z-0 relative">
            <MapContainer 
                center={position ? [position.lat, position.lng] : defaultPosition} 
                zoom={position ? 15 : 4} 
                style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                {!readonly && <MapEvents setPosition={setPosition} />}
                {position && <Marker position={[position.lat, position.lng]} />}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
