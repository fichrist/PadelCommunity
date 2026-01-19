import { useState, useCallback } from 'react';

/**
 * Hook for geolocation and distance calculations
 * Platform-agnostic - works for both React Web and React Native
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Haversine formula to calculate distance between two lat/lng points in km
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export interface UseGeolocationReturn {
  selectedLocation: string;
  selectedLocationCoords: Coordinates | null;
  selectedRadius: string;
  setSelectedLocation: (location: string) => void;
  setSelectedLocationCoords: (coords: Coordinates | null) => void;
  setSelectedRadius: (radius: string) => void;
  isWithinRadius: (itemLat?: number | null, itemLng?: number | null) => boolean;
  getDistance: (itemLat?: number | null, itemLng?: number | null) => number | null;
  resetLocation: () => void;
}

/**
 * Hook for managing location selection and radius-based filtering
 */
export const useGeolocation = (): UseGeolocationReturn => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<Coordinates | null>(null);
  const [selectedRadius, setSelectedRadius] = useState('');

  const getDistance = useCallback(
    (itemLat?: number | null, itemLng?: number | null): number | null => {
      if (
        !selectedLocationCoords ||
        itemLat == null ||
        itemLng == null
      ) {
        return null;
      }
      return calculateDistance(
        selectedLocationCoords.lat,
        selectedLocationCoords.lng,
        itemLat,
        itemLng
      );
    },
    [selectedLocationCoords]
  );

  const isWithinRadius = useCallback(
    (itemLat?: number | null, itemLng?: number | null): boolean => {
      // If no location filter is set, show all items
      if (!selectedLocationCoords || !selectedRadius) {
        return true;
      }

      const distance = getDistance(itemLat, itemLng);
      if (distance === null) {
        return false;
      }

      const radiusKm = parseInt(selectedRadius);
      return distance <= radiusKm;
    },
    [selectedLocationCoords, selectedRadius, getDistance]
  );

  const resetLocation = useCallback(() => {
    setSelectedLocation('');
    setSelectedLocationCoords(null);
    setSelectedRadius('');
  }, []);

  return {
    selectedLocation,
    selectedLocationCoords,
    selectedRadius,
    setSelectedLocation,
    setSelectedLocationCoords,
    setSelectedRadius,
    isWithinRadius,
    getDistance,
    resetLocation,
  };
};
