import React, { useRef, useState, useEffect } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const defaultLibraries: any[] = ['places'];

export default function LocationSearch({ onLocationSelect, placeholder = "Search location...", initialLocation }: { onLocationSelect: (location: { lat: number, lng: number }) => void, placeholder?: string, initialLocation?: { lat: number, lng: number } }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: defaultLibraries
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (initialLocation) {
        setInputValue(`${initialLocation.lat.toFixed(4)}, ${initialLocation.lng.toFixed(4)}`);
    }
  }, [initialLocation]);

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        onLocationSelect({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
        if (place.formatted_address) {
            setInputValue(place.formatted_address);
        } else if (place.name) {
            setInputValue(place.name);
        }
      }
    }
  };

  if (!isLoaded) return (
    <div className="relative">
      <input type="text" readOnly placeholder="Loading search..." className="w-full bg-white text-gray-800 border border-gray-200 rounded-xl px-4 py-4 text-sm outline-none font-medium opacity-50" />
      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
    </div>
  );

  return (
    <div className="relative">
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white text-gray-800 border border-gray-200 rounded-xl px-4 py-4 text-sm focus:ring-2 focus:ring-[#FFB800] outline-none transition-all font-medium" 
        />
      </Autocomplete>
      <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
    </div>
  );
}
