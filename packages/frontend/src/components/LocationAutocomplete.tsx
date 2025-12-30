import React, { useEffect, useRef, useState } from 'react';
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
  placeholder?: string;
  className?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Enter a city...",
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      if (!inputRef.current || apiLoaded) return;

      try {
        const loader = new Loader({
          apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // User needs to add their API key
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        setApiLoaded(true);

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          fields: ['formatted_address', 'geometry', 'name', 'address_components']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            onChange(place.formatted_address);
          }
        });

        autocompleteRef.current = autocomplete;
      } catch (error) {
        console.warn('Google Maps API not available, falling back to regular input');
      }
    };

    initializeAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, apiLoaded]);

  return (
    <div>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      {!apiLoaded && value === '' && (
        <p className="text-xs text-muted-foreground mt-1">
          Add your Google Maps API key for city autocomplete
        </p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
