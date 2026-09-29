import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths in Vite bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom SVG Icons
const createDriverIcon = (heading = 0) => {
  return L.divIcon({
    className: 'custom-driver-marker',
    html: `
      <div class="marker-beacon"></div>
      <div class="marker-icon-wrapper" style="transform: rotate(${heading}deg);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <path d="M9 17h6"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

const createPickupIcon = () => {
  return L.divIcon({
    className: 'custom-pickup-marker',
    html: `
      <div style="background: #10b981; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.5); border: 2px solid white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m7.5 4.27 9 5.15"/>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const createDestinationIcon = () => {
  return L.divIcon({
    className: 'custom-dest-marker',
    html: `
      <div style="background: #ef4444; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.5); border: 2px solid white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34]
  });
};

export const LiveTrackingMap = ({
  driverCoords,
  pickupCoords,
  deliveryCoords,
  driverInfo,
  etaMinutes,
  remainingDistanceKm,
  style = {}
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = driverCoords
        ? [driverCoords.latitude, driverCoords.longitude]
        : pickupCoords
        ? [pickupCoords.latitude, pickupCoords.longitude]
        : [37.7749, -122.4194]; // San Francisco

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tiles with responsive styling
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = [];

    // 1. Pickup Marker
    if (pickupCoords?.latitude && pickupCoords?.longitude) {
      const pickupLatLng = [pickupCoords.latitude, pickupCoords.longitude];
      bounds.push(pickupLatLng);

      if (!pickupMarkerRef.current) {
        pickupMarkerRef.current = L.marker(pickupLatLng, {
          icon: createPickupIcon()
        })
          .bindPopup('<b>Pickup Location</b><br/>Depot / Origin')
          .addTo(map);
      } else {
        pickupMarkerRef.current.setLatLng(pickupLatLng);
      }
    }

    // 2. Delivery Destination Marker
    if (deliveryCoords?.latitude && deliveryCoords?.longitude) {
      const destLatLng = [deliveryCoords.latitude, deliveryCoords.longitude];
      bounds.push(destLatLng);

      if (!destMarkerRef.current) {
        destMarkerRef.current = L.marker(destLatLng, {
          icon: createDestinationIcon()
        })
          .bindPopup('<b>Delivery Destination</b><br/>Customer Address')
          .addTo(map);
      } else {
        destMarkerRef.current.setLatLng(destLatLng);
      }
    }

    // 3. Driver Moving Marker
    if (driverCoords?.latitude && driverCoords?.longitude) {
      const driverLatLng = [driverCoords.latitude, driverCoords.longitude];
      bounds.push(driverLatLng);

      const heading = driverCoords.heading || 0;
      const speed = driverCoords.speed ? Math.round(driverCoords.speed * 3.6) : 0; // km/h

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
          <b style="color: #2563eb;">🚚 Courier: ${driverInfo?.user?.full_name || 'Assigned Driver'}</b><br/>
          Vehicle: ${driverInfo?.vehicle_type || 'Motorcycle'}<br/>
          Speed: ${speed} km/h<br/>
          ${etaMinutes ? `<b>ETA: ${etaMinutes} mins</b> (${remainingDistanceKm || '0'} km)` : ''}
        </div>
      `;

      if (!driverMarkerRef.current) {
        driverMarkerRef.current = L.marker(driverLatLng, {
          icon: createDriverIcon(heading)
        })
          .bindPopup(popupContent)
          .addTo(map);
      } else {
        // Smoothly pan & update position
        driverMarkerRef.current.setLatLng(driverLatLng);
        driverMarkerRef.current.setIcon(createDriverIcon(heading));
        driverMarkerRef.current.setPopupContent(popupContent);
      }
    }

    // 4. Draw Route Polyline connecting points
    const routePoints = [];
    if (pickupCoords?.latitude) routePoints.push([pickupCoords.latitude, pickupCoords.longitude]);
    if (driverCoords?.latitude) routePoints.push([driverCoords.latitude, driverCoords.longitude]);
    if (deliveryCoords?.latitude) routePoints.push([deliveryCoords.latitude, deliveryCoords.longitude]);

    if (routePoints.length >= 2) {
      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(routePoints, {
          color: '#2563eb',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
          lineJoin: 'round'
        }).addTo(map);
      } else {
        routePolylineRef.current.setLatLngs(routePoints);
      }
    }

    // Auto-fit bounds if we have valid coordinates
    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } catch (e) {}
    }
  }, [driverCoords, pickupCoords, deliveryCoords, driverInfo, etaMinutes, remainingDistanceKm]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '380px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)',
        ...style
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Live Status Overlay Pill */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 1000,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-light)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <span
          className="animate-pulse-glow"
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: driverCoords ? '#10b981' : '#f59e0b'
          }}
        />
        <span>{driverCoords ? 'LIVE GPS ACTIVE' : 'CONNECTING TO SATELLITE...'}</span>
        {etaMinutes && (
          <span style={{ color: 'var(--primary)', borderLeft: '1px solid var(--border-light)', paddingLeft: '8px' }}>
            ETA: {etaMinutes} MINS
          </span>
        )}
      </div>
    </div>
  );
};
