import * as React from "react";
import { useState } from "react";
import { MapPin, Navigation, Search, Check, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export interface LocationData {
  city: string;
  address: string;
  pincode: string;
  state: string;
  latitude: number;
  longitude: number;
}

interface LocationMapPickerProps {
  initialLocation?: Partial<LocationData>;
  onLocationSelect: (location: LocationData) => void;
}

// Key commercial & market hubs in Rajahmundry & neighbouring areas
const POPULAR_LOCALITIES: Array<{
  name: string;
  area: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
}> = [
  {
    name: "Main Road",
    area: "Main Road Commercial Market, Near Syamala Theatre",
    city: "Rajahmundry",
    pincode: "533101",
    lat: 16.9890,
    lng: 81.7840,
  },
  {
    name: "Danavaipeta",
    area: "Danavaipeta 4th Street, Near Appollo Pharmacy",
    city: "Rajahmundry",
    pincode: "533103",
    lat: 17.0005,
    lng: 81.7802,
  },
  {
    name: "Aryapuram",
    area: "Aryapuram Main Road, Commercial Complex",
    city: "Rajahmundry",
    pincode: "533104",
    lat: 16.9942,
    lng: 81.7761,
  },
  {
    name: "Morampudi",
    area: "Morampudi Junction, Highway Commercial Road",
    city: "Rajahmundry",
    pincode: "533106",
    lat: 17.0210,
    lng: 81.8021,
  },
  {
    name: "Innespeta",
    area: "Innespeta Commercial Market, Near River Bank",
    city: "Rajahmundry",
    pincode: "533101",
    lat: 16.9821,
    lng: 81.7725,
  },
  {
    name: "Kotipalli Bus Stand",
    area: "Near Kotipalli Bus Stand & Railway Station Road",
    city: "Rajahmundry",
    pincode: "533101",
    lat: 16.9912,
    lng: 81.7891,
  },
  {
    name: "Diwancheruvu",
    area: "Diwancheruvu NH-16 Hub, Near Educational Corridor",
    city: "Rajahmundry",
    pincode: "533296",
    lat: 17.0650,
    lng: 81.8480,
  },
  {
    name: "Kakinada Main Market",
    area: "Cinema Road, Main Market",
    city: "Kakinada",
    pincode: "533001",
    lat: 16.9891,
    lng: 82.2475,
  },
];

export function LocationMapPicker({
  initialLocation,
  onLocationSelect,
}: LocationMapPickerProps) {
  const [lat, setLat] = useState<number>(initialLocation?.latitude || 16.9890);
  const [lng, setLng] = useState<number>(initialLocation?.longitude || 81.7840);
  const [activeLocality, setActiveLocality] = useState<string>(
    initialLocation?.city || "Rajahmundry Main Road"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Apply location change
  const selectCoordinates = (
    newLat: number,
    newLng: number,
    localityName: string,
    city = "Rajahmundry",
    address = "",
    pincode = "533101"
  ) => {
    setLat(newLat);
    setLng(newLng);
    setActiveLocality(localityName);
    onLocationSelect({
      latitude: newLat,
      longitude: newLng,
      city,
      address: address || `${localityName}, ${city}`,
      pincode,
      state: "Andhra Pradesh",
    });
  };

  // Live GPS geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your device / browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        setActiveLocality("Current GPS Location");

        // Try reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.suburb ||
              "Rajahmundry";
            const road = addr.road || addr.neighbourhood || addr.suburb || "";
            const postcode = addr.postcode || "533101";
            const fullAddr = data.display_name
              ? data.display_name.split(",").slice(0, 3).join(",")
              : `${road}, ${city}`;

            selectCoordinates(
              userLat,
              userLng,
              road || city,
              city,
              fullAddr,
              postcode
            );
            toast.success(`📍 Located: ${road || city}, ${city}`);
            setIsLocating(false);
            return;
          }
        } catch {
          // fallback to coordinates if reverse geocode blocked
        }

        selectCoordinates(
          userLat,
          userLng,
          "Current Storefront Location",
          "Rajahmundry",
          `Storefront Location (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`,
          "533101"
        );
        toast.success("📍 Exact GPS coordinates pinned!");
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        toast.error(
          err.message ||
            "Unable to access your GPS location. Please choose an area or search below."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Search locality / address via OpenStreetMap Nominatim
  const handleSearchLocality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check predefined list first
    const queryLower = searchQuery.toLowerCase().trim();
    const matchedPreset = POPULAR_LOCALITIES.find(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.area.toLowerCase().includes(queryLower) ||
        p.city.toLowerCase().includes(queryLower)
    );

    if (matchedPreset) {
      selectCoordinates(
        matchedPreset.lat,
        matchedPreset.lng,
        matchedPreset.name,
        matchedPreset.city,
        matchedPreset.area,
        matchedPreset.pincode
      );
      toast.success(`📍 Map pinned to ${matchedPreset.name}, ${matchedPreset.city}`);
      return;
    }

    setIsSearching(true);
    try {
      const q = encodeURIComponent(`${searchQuery}, Andhra Pradesh, India`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const newLat = parseFloat(item.lat);
          const newLng = parseFloat(item.lon);
          const displayName = item.display_name.split(",")[0];
          selectCoordinates(
            newLat,
            newLng,
            displayName,
            "Rajahmundry",
            item.display_name.split(",").slice(0, 3).join(","),
            "533101"
          );
          toast.success(`📍 Map centered at ${displayName}`);
          setIsSearching(false);
          return;
        }
      }
      toast.error("Location not found on map. Please try a nearby area.");
    } catch {
      toast.error("Network error while searching location.");
    } finally {
      setIsSearching(false);
    }
  };

  // OpenStreetMap embed URL with pin marker
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${(
    lng - 0.007
  ).toFixed(6)}%2C${(lat - 0.005).toFixed(6)}%2C${(lng + 0.007).toFixed(
    6
  )}%2C${(lat + 0.005).toFixed(6)}&layer=mapnik&marker=${lat.toFixed(
    6
  )}%2C${lng.toFixed(6)}`;

  const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className="space-y-2.5 rounded-2xl border border-border/80 bg-muted/20 p-3 sm:p-4">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>Storefront Map Pin</span>
              <Badge className="bg-rose-500 text-white text-[9px] px-1.5 py-0 font-bold">
                Live GPS
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Pin your shop's exact location for local buyers & delivery
            </p>
          </div>
        </div>

        {/* Live GPS Locate Me Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="h-8 rounded-full border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-semibold gap-1.5 shrink-0"
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Navigation className="h-3.5 w-3.5 text-rose-500" />
          )}
          <span>{isLocating ? "Detecting GPS…" : "Use My Live GPS"}</span>
        </Button>
      </div>

      {/* Search Input for Map */}
      <form onSubmit={handleSearchLocality} className="relative flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search market, road, or area (e.g. Danavaipeta, Main Road)..."
            className="h-8.5 rounded-xl pl-8 text-xs bg-background"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isSearching}
          className="h-8.5 rounded-xl text-xs px-3 bg-rose-600 hover:bg-rose-700 text-white shrink-0 font-semibold"
        >
          {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Pin Map"}
        </Button>
      </form>

      {/* Quick Locality Selectors */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" /> Quick Hubs:
        </span>
        {POPULAR_LOCALITIES.slice(0, 6).map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() =>
              selectCoordinates(
                item.lat,
                item.lng,
                item.name,
                item.city,
                item.area,
                item.pincode
              )
            }
            className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
              activeLocality === item.name
                ? "bg-rose-600 text-white border-rose-600 font-bold shadow-xs"
                : "bg-background text-foreground/80 border-border hover:border-rose-400 hover:bg-rose-50/50"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Interactive Map Frame with Pin Marker */}
      <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden border border-border shadow-xs bg-muted/40">
        <iframe
          title="Storefront Location Map"
          src={mapEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          scrolling="no"
        />

        {/* Overlay Marker Badge on top of Map */}
        <div className="absolute top-2.5 left-2.5 bg-background/95 backdrop-blur-md border border-border px-2.5 py-1 rounded-xl text-[10px] font-semibold text-foreground flex items-center gap-1.5 shadow-md">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pinned: {activeLocality}</span>
          <span className="text-muted-foreground font-mono text-[9px]">
            ({lat.toFixed(4)}, {lng.toFixed(4)})
          </span>
        </div>

        {/* Link to Open in Google Maps */}
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2.5 right-2.5 bg-background/95 backdrop-blur-md border border-border px-2.5 py-1 rounded-xl text-[10px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 shadow-md transition-colors"
        >
          <span>Open Google Maps</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
        <span className="flex items-center gap-1">
          <Check className="h-3 w-3 text-emerald-500 stroke-[3]" />
          Coordinates auto-saved for buyer GPS navigation & local delivery
        </span>
      </div>
    </div>
  );
}
