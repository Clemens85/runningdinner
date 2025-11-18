import { useEffect, useState } from 'react';

const defaultSettings = {
  enableHighAccuracy: false,
  timeout: Infinity,
  maximumAge: 0,
};

export interface PositionSettings {
  enableHighAccuracy?: boolean;
  timeout?: any;
  maximumAge?: number;
}

export interface Position {
  latitude?: number;
  longitude?: number;
  accuracy?: any;
  speed?: any;
  timestamp?: any;
  error?: string;
}

export const useGeoPosition = (watch = false, settings: PositionSettings = defaultSettings) => {
  const [position, setPosition] = useState<Position>({});
  // const [error, setError] = useState<string | null>(null);

  const onChange = ({ coords, timestamp }: any) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      speed: coords.speed,
      timestamp,
    });
  };

  function setError(error: string) {
    setPosition((prev) => {
      return {
        ...prev,
        error,
      };
    });
  }

  const onError = (error: any) => {
    setError(error.message);
  };

  useEffect(() => {
    if (!navigator || !navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    let watcher: any;
    if (watch) {
      watcher = navigator.geolocation.watchPosition(onChange, onError, settings);
    } else {
      navigator.geolocation.getCurrentPosition(onChange, onError, settings);
    }

    return () => watcher && navigator.geolocation.clearWatch(watcher);
    // eslint-disable-next-line
  }, [settings.enableHighAccuracy, settings.timeout, settings.maximumAge]);

  return { ...position };
};
