import React, { useEffect, useRef } from 'react';
import { UWEvent } from '../types';
import { formatTime } from '../utils';

interface MapViewProps {
  events: UWEvent[];
  userLocation: { lat: number; lng: number } | null;
  onEventSelect: (id: string) => void;
  hidePopupActions?: boolean;
}

const MapView: React.FC<MapViewProps> = ({ events, userLocation, onEventSelect, hidePopupActions = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Check if Leaflet is loaded
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      // Default to Red Square if no user location
      const center = userLocation ? [userLocation.lat, userLocation.lng] : [47.6559, -122.3092];
      const map = L.map(mapRef.current).setView(center, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing layers (markers)
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Custom Icons
    const userIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const eventIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #4b2e83; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); color: white; font-weight: bold;">W</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    // Add User Marker
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>You are here</b>")
        .openPopup();
    }

    // Add Event Markers
    const markers: any[] = [];
    events.forEach(event => {
      const marker = L.marker([event.coordinates.lat, event.coordinates.lng], { icon: eventIcon })
        .addTo(map);

      if (!hidePopupActions) {
        marker.bindPopup(`
          <div class="min-w-[150px]">
            <h3 class="font-bold text-uw-purple">${event.title}</h3>
            <p class="text-xs text-gray-600">${event.organizer}</p>
            <p class="text-xs mt-1">${formatTime(event.startTime)} - ${formatTime(event.endTime)}</p>
            <button onclick="document.getElementById('btn-${event.id}').click()" class="mt-2 text-xs text-blue-600 underline hover:text-blue-800">View Details</button>
            <button id="btn-${event.id}" style="display:none"></button>
          </div>
        `);
        
        // Hacky way to handle click inside popup back to React
        marker.on('popupopen', () => {
           const btn = document.getElementById(`btn-${event.id}`);
           if (btn) {
             btn.onclick = () => onEventSelect(event.id);
           }
        });
      }

      markers.push(marker);
    });

    // Fit bounds to show all markers including user
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      if (userLocation) {
        const userMarker = L.marker([userLocation.lat, userLocation.lng]);
        group.addLayer(userMarker);
      }
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    // Cleanup function
    return () => {
      // We don't destroy the map instance here because strict mode might mount/unmount rapidly,
      // but if the component is truly removed (like in a modal), we might want to.
      // For now, we just let the ref persist or handle specific cleanup if needed.
      // Actually, for the Modal case, we MUST remove the map because the container div will disappear.
      if (hidePopupActions) { 
        // Heuristic: If it's the modal map (hidePopupActions is true), we definitely want to destroy it on unmount
        map.remove();
        mapInstanceRef.current = null;
      }
    };

  }, [events, userLocation, onEventSelect, hidePopupActions]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-xl z-0" />;
};

export default MapView;
