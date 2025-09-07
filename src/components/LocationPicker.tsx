import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
  initialLocation?: { lat: number; lng: number; name: string };
  onClose: () => void;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click(e: L.LeafletMouseEvent) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export function LocationPicker({ onLocationSelect, initialLocation, onClose }: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(
    initialLocation || null
  );
  const [locationName, setLocationName] = useState(initialLocation?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationClick = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      // Use OpenStreetMap Nominatim API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      const name = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setLocationName(name);
      setSelectedLocation({ lat, lng, name });
    } catch (error) {
      console.error("Error getting location name:", error);
      const name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setLocationName(name);
      setSelectedLocation({ lat, lng, name });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect({ ...selectedLocation, name: locationName });
      onClose();
    }
  };

  const defaultCenter: [number, number] = initialLocation 
    ? [initialLocation.lat, initialLocation.lng] 
    : [40.7128, -74.0060]; // New York City as default

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="relative max-w-4xl w-full bg-gradient-to-br from-slate-900/95 to-purple-900/95 rounded-3xl border border-cyan-500/30 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Select Location
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-800/50 hover:bg-slate-700/50 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300 mt-2">Click on the map to select a location</p>
        </div>

        {/* Map */}
        <div className="p-6">
          <div className="h-96 rounded-2xl overflow-hidden border border-white/10">
            <MapContainer
              center={defaultCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker onLocationSelect={handleLocationClick} />
              {initialLocation && (
                <Marker position={[initialLocation.lat, initialLocation.lng]} />
              )}
            </MapContainer>
          </div>

          {/* Location Details */}
          {selectedLocation && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Location Name</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all duration-300"
                  placeholder="Enter a custom name for this location"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Latitude</label>
                  <div className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-300">
                    {selectedLocation.lat.toFixed(6)}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Longitude</label>
                  <div className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-300">
                    {selectedLocation.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800/50 text-slate-300 font-semibold rounded-xl hover:bg-slate-700/50 transition-colors border border-slate-600/50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedLocation || isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "Loading..." : "Confirm Location"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
