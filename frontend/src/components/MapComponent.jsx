// frontend/src/components/MapComponent.jsx
// Map visualization of customer location and recommended mechanics.
// Uses react-leaflet (Leaflet + OpenStreetMap) – no API key required.

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRecommendedMechanics } from '../services/mechanicService';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons (Leaflet's default images expect assets path)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const MapComponent = ({ customerCoords, issueType }) => {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // customerCoords is [longitude, latitude] per stored GeoJSON
  const [lng, lat] = customerCoords || [0, 0];

  useEffect(() => {
    if (!lng || !lat) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getRecommendedMechanics({
          longitude: lng,
          latitude: lat,
          issueType: issueType || 'engine',
          maxResults: 20
        });
        setMechanics(data.mechanics || []);
        setError(null);
      } catch (e) {
        setError(e.message || 'Failed to load mechanics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lng, lat, issueType]);

  // Leaflet expects [lat, lng]
  const center = [lat, lng];

  return (
    <div style={{ height: '400px', width: '100%', marginBottom: '1rem' }}>
      {error && <div className="alert alert-danger">{error}</div>}
      <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Customer marker */}
        <CircleMarker center={center} radius={10} pathOptions={{ color: 'blue', fillColor: 'blue' }}>
          <Popup>📍 Your location</Popup>
        </CircleMarker>
        {/* Mechanic markers */}
        {mechanics.map((m, idx) => {
          const mechPos = m.location && m.location.length === 2 ? [m.location[1], m.location[0]] : null; // [lat, lng]
          if (!mechPos) return null;
          return (
            <Marker key={idx} position={mechPos}>
              <Popup>
                <strong>{m.name}</strong><br />
                Distance: {m.distanceKm?.toFixed(2)} km<br />
                Rating: {m.rating?.toFixed(1)} / 5<br />
                Experience: {m.experience} yr(s)<br />
                Specialization: {Array.isArray(m.specialization) ? m.specialization.join(', ') : ''}<br />
                Match Score: {m.matchScore}%<br />
                <em>{Array.isArray(m.recommendationReasons) ? m.recommendationReasons.join(' | ') : ''}</em>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {loading && <div className="mt-2 text-center">Loading nearby mechanics…</div>}
    </div>
  );
};

export default MapComponent;
