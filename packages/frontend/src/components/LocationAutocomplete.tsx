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
  const [inputMounted, setInputMounted] = useState(false);

  // Use refs to avoid stale closures
  const onChangeRef = useRef(onChange);
  const onPlaceSelectedRef = useRef(onPlaceSelected);

  // Update refs when callbacks change
  useEffect(() => {
    onChangeRef.current = onChange;
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onChange, onPlaceSelected]);

  // Track when input is mounted
  useEffect(() => {
    if (inputRef.current) {
      setInputMounted(true);
    }
  }, []);

  useEffect(() => {
    console.log("LocationAutocomplete useEffect running, inputMounted:", inputMounted);

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
        setApiLoaded(true); // Mark as loaded so user can still type
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

        // Double-check inputRef is still valid after async load
        if (!inputRef.current) {
          console.log("Input ref became null after API load");
          return;
        }

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

          // Get the value directly from the input element (Google Places updates it)
          const inputValue = inputRef.current?.value || '';
          const addressValue = place.formatted_address || inputValue;

          if (addressValue) {
            console.log("Calling onChange with:", addressValue);
            onChangeRef.current(addressValue);
            // Call the callback with full place object if provided
            console.log("onPlaceSelected callback exists?", !!onPlaceSelectedRef.current);
            if (onPlaceSelectedRef.current) {
              console.log("Calling onPlaceSelected callback");
              onPlaceSelectedRef.current(place);
            }
          } else {
            console.log("No address value found");
          }
        });

        autocompleteRef.current = autocomplete;
      } catch (error) {
        console.warn('Google Maps API not available, falling back to regular input:', error);
        setApiLoaded(true); // Mark as loaded so user can still type
      }
    };

    // Small delay to ensure DOM is ready, especially in dialogs
    const timeoutId = setTimeout(() => {
      initializeAutocomplete();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [inputMounted]); // Re-run when input becomes mounted

  // Handle manual input changes (for when user types without selecting from dropdown)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Sync input value when the value prop changes from outside (e.g., form reset)
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  // Fix for dialogs: add click handler to pac-container to prevent dialog from closing
  useEffect(() => {
    // Find and handle pac-container clicks
    const handlePacContainerClick = (e: MouseEvent) => {
      // Prevent the click from propagating to the dialog overlay
      e.stopPropagation();
    };

    // Watch for pac-container being added to DOM
    const observer = new MutationObserver(() => {
      const pacContainer = document.querySelector('.pac-container') as HTMLElement;
      if (pacContainer && !pacContainer.dataset.clickHandlerAdded) {
        pacContainer.dataset.clickHandlerAdded = 'true';
        pacContainer.addEventListener('mousedown', handlePacContainerClick, true);
        pacContainer.addEventListener('click', handlePacContainerClick, true);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      const pacContainer = document.querySelector('.pac-container') as HTMLElement;
      if (pacContainer) {
        pacContainer.removeEventListener('mousedown', handlePacContainerClick, true);
        pacContainer.removeEventListener('click', handlePacContainerClick, true);
      }
    };
  }, [apiLoaded]);

  return (
    <div>
      <Input
        ref={inputRef}
        defaultValue={value}
        onChange={handleInputChange}
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
