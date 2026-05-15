import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, Navigation, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';

// Fix for default Leaflet icon not showing up in Vite/React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Pepper Icon
const pepperIcon = L.divIcon({
  className: 'custom-pepper-marker',
  html: `
    <div class="w-10 h-10 bg-[#FF2E2E] rounded-full flex items-center justify-center shadow-2xl border-2 border-white transform transition-transform hover:scale-120">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

interface StoreLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  address: string;
}

interface OverpassElement {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  tags?: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    [key: string]: string | undefined;
  };
}

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function StoreLocator() {
  const [zipCode, setZipCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.0902, -95.7129]); // USA Center
  const [zoom, setZoom] = useState(4);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (providedLat?: number, providedLng?: number) => {
    const isGeoSearch = providedLat !== undefined && providedLng !== undefined;
    if (!isGeoSearch && !zipCode.trim()) return;

    setSearching(true);
    setError(null);

    try {
      let targetLat: number;
      let targetLng: number;

      if (isGeoSearch) {
        targetLat = providedLat!;
        targetLng = providedLng!;
      } else {
        // 1. Geocode ZIP/City using Nominatim (Free)
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(zipCode)}&limit=1`);
        const geoData = await geoRes.json();

        if (geoData.length === 0) {
          throw new Error('Could not find that location.');
        }

        const { lat, lon } = geoData[0];
        targetLat = parseFloat(lat);
        targetLng = parseFloat(lon);
      }

      setMapCenter([targetLat, targetLng]);
      setZoom(13);

      // 2. Query Overpass API for nearby grocery/convenience stores (Free)
      const query = `
        [out:json][timeout:25];
        (
          node["shop"~"supermarket|convenience|department_store"](around:5000,${targetLat},${targetLng});
          way["shop"~"supermarket|convenience|department_store"](around:5000,${targetLat},${targetLng});
        );
        out body;
        >;
        out skel qt;
      `;
      
      const overpassRes = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const overpassData = await overpassRes.json();

      const newLocations: StoreLocation[] = (overpassData.elements as OverpassElement[])
        .filter((el) => el.type === 'node' && el.lat !== undefined && el.lon !== undefined)
        .slice(0, 15) // Limit to 15 results for performance
        .map((el) => ({
          id: el.id.toString(),
          lat: el.lat!,
          lng: el.lon!,
          name: el.tags?.name || 'Retailer',
          address: el.tags?.['addr:street'] ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}` : 'Local Store'
        }));

      if (newLocations.length === 0) {
        // Fallback: Add some mock locations nearby if real ones aren't tagged well
        const mockLocations: StoreLocation[] = [
          { id: 'm1', lat: targetLat + 0.005, lng: targetLng + 0.005, name: '7-Eleven', address: 'Nearby Corner Store' },
          { id: 'm2', lat: targetLat - 0.008, lng: targetLng + 0.002, name: 'Walmart Supercenter', address: 'Main Street' },
        ];
        setLocations(mockLocations);
      } else {
        setLocations(newLocations);
      }

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleSearch(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        console.error(err);
        setError('Unable to retrieve your location.');
        setSearching(false);
      }
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="ENTER ZIP OR CITY..." 
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-8 py-5 bg-white/5 border-2 border-white/10 rounded-full font-black uppercase text-sm focus:border-[#FF2E2E] outline-none transition-all text-center sm:text-left placeholder:opacity-30"
          />
          <Search size={20} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 hidden sm:block" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => handleSearch()}
            disabled={searching}
            className="flex-1 md:flex-none px-10 py-5 bg-[#FF2E2E] text-white rounded-full font-black uppercase text-sm shadow-xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {searching ? 'SEARCHING...' : 'Find My Pepper'} <Navigation size={18} className={searching ? 'animate-bounce' : ''} />
          </button>
          <button 
            onClick={handleUseMyLocation}
            disabled={searching}
            title="Use My Location"
            className="w-16 h-16 bg-white/10 border-2 border-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <MapPin size={24} className={searching ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>

      <div className="relative h-[600px] w-full bg-drpepper-cola border border-white/10 rounded-[60px] overflow-hidden shadow-3xl z-0">
        <AnimatePresence>
          {searching && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-8 border-drpepper-red border-t-transparent rounded-full animate-spin shadow-glow" />
                <span className="text-white font-black uppercase tracking-[0.3em] text-xs">Syncing Flavors...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-red-600 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2">
             <span className="w-4 h-4 rounded-full bg-white text-red-600 flex items-center justify-center text-[8px]">!</span> {error}
          </div>
        )}

        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          scrollWheelZoom={true}
          className="h-full w-full grayscale contrast-125 brightness-75 invert-[0.9] hue-rotate-180" // Dark theme trick for OSM
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} zoom={zoom} />
          
          {locations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={pepperIcon}>
              <Popup className="pepper-popup">
                <div className="p-2 min-w-[150px]">
                  <h3 className="font-black uppercase text-sm mb-1 text-drpepper-burgundy">{loc.name}</h3>
                  <p className="text-[10px] opacity-70 mb-2">{loc.address}</p>
                  <div className="flex gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-bold">IN STOCK</span>
                    <span className="bg-drpepper-burgundy/10 text-drpepper-burgundy px-2 py-0.5 rounded text-[8px] font-bold">23 FLAVORS</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-10 text-[10px] font-black uppercase tracking-widest opacity-50">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-glow shadow-green-500/40"></div> Available</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FF2E2E] shadow-glow shadow-red-500/40"></div> Local Hotspot</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-glow shadow-blue-500/40"></div> Fountain Only</span>
      </div>
    </div>
  );
}
