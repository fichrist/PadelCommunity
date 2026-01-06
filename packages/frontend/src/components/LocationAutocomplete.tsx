import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Loader } from '@googlemaps/js-api-loader';

// Type declarations for Google Maps API
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    namespace places {
      class Autocomplete {
        constructor(input: HTMLInputElement, options?: any);
        addListener(eventName: string, handler: () => void): void;
        getPlace(): { formatted_address?: string; geometry?: any; name?: string };
      }
    }
    namespace event {
      function clearInstanceListeners(instance: any): void;
    }
  }
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: any) => void;  // Callback with full place object
  placeholder?: string;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Enter a city...",
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);
  
  // Use refs to avoid stale closures
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  
  // Update refs when callbacks change
  useEffect(() => {
    onChangeRef.current = onChange;
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onChange, onPlaceSelected]);

  useEffect(() => {
    console.log("LocationAutocomplete useEffect running");
    
    const initializeAutocomplete = async () => {
      console.log("initializeAutocomplete called");
      if (!inputRef.current) {
        console.log("No inputRef.current, returning");
        return;
      }
      if (autocompleteRef.current) {
        console.log("Autocomplete already initialized, returning");
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      console.log("API Key exists?", !!apiKey);
      
      // If no API key, just use regular input
      if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.warn('Google Maps API key not configured');
        return;
      }

      try {
        console.log("Loading Google Maps API...");
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        console.log("Google Maps API loaded successfully");
        setApiLoaded(true);

        console.log("Creating Autocomplete instance...");
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          fields: ['place_id', 'formatted_address', 'geometry', 'name', 'address_components']
        });
        console.log("Autocomplete instance created");

        console.log("Adding place_changed listener...");
        autocomplete.addListener('place_changed', () => {
          console.log("=== PLACE_CHANGED EVENT FIRED ===");
          const place = autocomplete.getPlace();
          console.log("Place object:", place);
          if (place.formatted_address) {
            console.log("Calling onChange with:", place.formatted_address);
            onChangeRef.current(place.formatted_address);
            // Call the callback with full place object if provided
            console.log("onPlaceSelected callback exists?", !!onPlaceSelectedRef.current);
            if (onPlaceSelectedRef.current) {
              console.log("Calling onPlaceSelected callback");
              onPlaceSelectedRef.current(place);
            }
          } else {
            console.log("No formatted_address in place object");
          }
        });

        autocompleteRef.current = autocomplete;
      } catch (error) {
        console.warn('Google Maps API not available, falling back to regular input:', error);
      }
    };

    initializeAutocomplete();

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []); // Empty deps - initialize once, use refs for callbacks

  return (
    <div>
      <Input
        ref={inputRef}
        defaultValue={value}
        placeholder={placeholder}
        className={className}
      />
      {!apiLoaded && (
        <p className="text-xs text-muted-foreground mt-1">
          Loading address autocomplete...
        </p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
