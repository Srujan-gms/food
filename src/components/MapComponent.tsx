import React from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 12.9716,
  lng: 77.5946
};

const defaultLibraries: any[] = ['places'];

export default function MapComponent({ 
  pickupLocation, 
  dropoffLocation, 
  volunteerLocation,
  availablePickups,
  activeRoute,
  onLocationSelect
}: { 
  pickupLocation?: { lat: number, lng: number },
  dropoffLocation?: { lat: number, lng: number },
  volunteerLocation?: { lat: number, lng: number },
  availablePickups?: { id: string, lat: number, lng: number }[],
  activeRoute?: { lat: number, lng: number }[],
  onLocationSelect?: (location: { lat: number, lng: number }) => void
}) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    // Uses environment variable, works without it (with watermark)
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: defaultLibraries
  });

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={volunteerLocation || pickupLocation || dropoffLocation || center}
      zoom={14}
      onClick={(e) => {
        if (e.latLng && onLocationSelect) {
          onLocationSelect({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      }}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            "elementType": "geometry",
            "stylers": [{ "color": "#f5f5f5" }]
          },
          {
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#616161" }]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#f5f5f5" }]
          },
          {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#bdbdbd" }]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{ "color": "#eeeeee" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{ "color": "#ffffff" }]
          },
          {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#757575" }]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{ "color": "#dadada" }]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#616161" }]
          },
          {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9e9e9e" }]
          },
          {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [{ "color": "#e5e5e5" }]
          },
          {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [{ "color": "#eeeeee" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#c9c9c9" }]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9e9e9e" }]
          }
        ]
      }}
    >
      {(activeRoute && activeRoute.length > 1) ? (
        <Polyline
          path={activeRoute}
          options={{
            strokeColor: '#FFB800',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      ) : (pickupLocation && dropoffLocation) && (
        <Polyline
          path={[pickupLocation, dropoffLocation]}
          options={{
            strokeColor: '#FFB800',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      )}
      
      {/* Markers */}
      {volunteerLocation && (
        <Marker 
          position={volunteerLocation} 
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE,
            fillColor: '#FFB800',
            fillOpacity: 1,
            strokeWeight: 4,
            strokeColor: '#FFFFFF',
            scale: 8
          }} 
        />
      )}
      {pickupLocation && (
        <Marker 
          position={pickupLocation}
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#FFFFFF',
            scale: 7
          }}
        />
      )}
      {dropoffLocation && (
        <Marker 
          position={dropoffLocation}
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#FFFFFF',
            scale: 7
          }}
        />
      )}
      {availablePickups?.map(pickup => (
        <Marker 
          key={pickup.id}
          position={pickup}
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE,
            fillColor: '#8B5CF6',
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: '#FFFFFF',
            scale: 7
          }}
        />
      ))}
    </GoogleMap>
  ) : <div className="w-full h-full bg-gray-50 flex items-center justify-center text-sm font-bold text-gray-400">Loading Map...</div>;
}

