import { useState, useEffect, useRef, useCallback } from 'react';
import { DEMO_ROUTE_COORDINATES } from '../constants';

export const useGeolocation = ({ onLocationChange, enabled = false } = {}) => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [isWatching, setIsWatching] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const watchIdRef = useRef(null);
  const simIndexRef = useRef(0);
  const simTimerRef = useRef(null);

  // Check browser permission status if supported
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          setPermissionStatus(status.state);
          status.onchange = () => setPermissionStatus(status.state);
        })
        .catch(() => {});
    }
  }, []);

  const handlePositionSuccess = useCallback(
    (position) => {
      const { latitude, longitude, speed, heading, accuracy } = position.coords;
      const newCoords = {
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || 0,
        accuracy: accuracy || 5.0,
        timestamp: position.timestamp
      };

      setCoords(newCoords);
      setError(null);
      setPermissionStatus('granted');

      if (onLocationChange) {
        onLocationChange(newCoords);
      }
    },
    [onLocationChange]
  );

  const handlePositionError = useCallback((err) => {
    let message = 'Unable to retrieve location';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Location permission was denied. Please allow access in browser settings.';
        setPermissionStatus('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'Location information is currently unavailable.';
        break;
      case err.TIMEOUT:
        message = 'The request to get user location timed out.';
        break;
      default:
        message = err.message || message;
    }
    setError(message);
    setIsWatching(false);
  }, []);

  // Start watching genuine GPS location
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setError(null);
    setIsWatching(true);
    setIsSimulating(false);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      options
    );
  }, [handlePositionSuccess, handlePositionError]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsWatching(false);
    setIsSimulating(false);
  }, []);

  // Simulated GPS route playback (helpful for testing driver movement without driving)
  const startSimulation = useCallback(() => {
    stopTracking();
    setIsSimulating(true);
    setIsWatching(true);
    setError(null);

    simIndexRef.current = 0;

    const emitNextPoint = () => {
      const point = DEMO_ROUTE_COORDINATES[simIndexRef.current];
      const simulatedPosition = {
        coords: {
          latitude: point.lat,
          longitude: point.lng,
          speed: 25 + Math.random() * 5,
          heading: 335 + Math.random() * 15,
          accuracy: 3.5
        },
        timestamp: Date.now()
      };

      handlePositionSuccess(simulatedPosition);

      simIndexRef.current = (simIndexRef.current + 1) % DEMO_ROUTE_COORDINATES.length;
    };

    emitNextPoint();
    simTimerRef.current = setInterval(emitNextPoint, 3000);
  }, [stopTracking, handlePositionSuccess]);

  // Handle external enabled prop changes
  useEffect(() => {
    if (enabled && !isWatching) {
      startTracking();
    } else if (!enabled && isWatching) {
      stopTracking();
    }
  }, [enabled]);

  // Clean up watchers on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simTimerRef.current) {
        clearInterval(simTimerRef.current);
      }
    };
  }, []);

  return {
    coords,
    error,
    permissionStatus,
    isWatching,
    isSimulating,
    startTracking,
    stopTracking,
    startSimulation
  };
};
