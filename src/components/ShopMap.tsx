"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Star, MapPin, Phone, Navigation, ExternalLink } from "lucide-react";
import Image from "next/image";


// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Simba Supermarket branch data with coordinates (Rwanda)
const shops = [
  {
    id: 1,
    name: "Simba — Kicukiro Branch",
    category: "Supermarket",
    status: "Open",
    rating: 4.8,
    reviews: 312,
    address: "KK 15 Ave, Kicukiro, Kigali",
    distance: 0.5,
    phone: "+250 788 100 001",
    image: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg",
    coordinates: [-1.9741, 30.0781] as [number, number],
    location: "Kigali"
  },
  {
    id: 2,
    name: "Simba — Remera Branch",
    category: "Supermarket",
    status: "Open",
    rating: 4.7,
    reviews: 204,
    address: "KG 11 Ave, Remera, Kigali",
    distance: 1.2,
    phone: "+250 788 100 002",
    image: "https://images.pexels.com/photos/949223/pexels-photo-949223.jpeg",
    coordinates: [-1.9503, 30.1084] as [number, number],
    location: "Kigali"
  },
  {
    id: 3,
    name: "Simba — Nyamirambo Branch",
    category: "Supermarket",
    status: "Open",
    rating: 4.6,
    reviews: 189,
    address: "KN 3 Rd, Nyamirambo, Kigali",
    distance: 0.8,
    phone: "+250 788 100 003",
    image: "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg",
    coordinates: [-1.9796, 30.0444] as [number, number],
    location: "Kigali"
  },
  {
    id: 4,
    name: "Simba — Gisozi Branch",
    category: "Supermarket",
    status: "Open",
    rating: 4.5,
    reviews: 143,
    address: "KG 7 Ave, Gisozi, Kigali",
    distance: 2.1,
    phone: "+250 788 100 004",
    image: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg",
    coordinates: [-1.9258, 30.0655] as [number, number],
    location: "Kigali"
  },
  {
    id: 5,
    name: "Simba — Nyabugogo Branch",
    category: "Supermarket",
    status: "Open",
    rating: 4.4,
    reviews: 98,
    address: "Nyabugogo Bus Park Area, Kigali",
    distance: 1.7,
    phone: "+250 788 100 005",
    image: "https://images.pexels.com/photos/949223/pexels-photo-949223.jpeg",
    coordinates: [-1.9389, 30.0522] as [number, number],
    location: "Kigali"
  },
  {
    id: 6,
    name: "Simba — Musanze Branch",
    category: "Supermarket",
    status: "Open",
    rating: 4.3,
    reviews: 145,
    address: "Main St, Musanze",
    distance: 0.0,
    phone: "+250 788 100 006",
    image: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg",
    coordinates: [-1.5036, 29.6344] as [number, number],
    location: "Musanze"
  },
  {
    id: 7,
    name: "Simba — Muhanga Branch",
    category: "Supermarket",
    status: "Open",
    rating: 4.2,
    reviews: 203,
    address: "Center Ave, Muhanga",
    distance: 0.0,
    phone: "+250 788 100 007",
    image: "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg",
    coordinates: [-2.0833, 29.7500] as [number, number],
    location: "Muhanga"
  },
  {
    id: 8,
    name: "Simba — Huye Branch",
    category: "Supermarket",
    status: "Open",
    rating: 4.6,
    reviews: 178,
    address: "Market Rd, Huye",
    distance: 0.0,
    phone: "+250 788 100 008",
    image: "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg",
    coordinates: [-2.6000, 29.7500] as [number, number],
    location: "Huye"
  }
];

const locations = ["All Shops", "Kigali", "Musanze", "Muhanga", "Huye", "Bugesera", "Rubavu"];

export default function ShopMap() {
  const [selectedLocation, setSelectedLocation] = useState("All Shops");
  const [selectedShop, setSelectedShop] = useState<typeof shops[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const [defaultIcon, setDefaultIcon] = useState<any>(null);
  const [selectedIcon, setSelectedIcon] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Fix Leaflet default icon issue and create custom icons
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;

        // Default icon
        const defaultIconInstance = L.icon({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        setDefaultIcon(defaultIconInstance);

        // Selected icon (larger Simba orange marker)
        const selectedIconInstance = L.divIcon({
          className: 'custom-selected-marker',
          html: `<div style="
            width: 36px;
            height: 36px;
            background-color: #FF6600;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 12px rgba(255,102,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          "><div style="
            width: 12px;
            height: 12px;
            background-color: white;
            border-radius: 50%;
          "></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        setSelectedIcon(selectedIconInstance);
      });
    }
  }, []);

  const filteredShops = shops.filter((shop) => {
    const matchesLocation = selectedLocation === "All Shops" || shop.location === selectedLocation;
    const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLocation && matchesSearch;
  });

  const center: [number, number] = selectedShop
    ? selectedShop.coordinates
    : [-1.9441, 30.0619]; // Default to Kigali center

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-1">Shop Locations</h2>
        <p className="text-sm text-muted-foreground">Interactive map showing all shop locations</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 h-full">
        {/* Left Panel - Shop List */}
        <div className="flex flex-col min-h-0">
          <Card className="p-3 flex-1 flex flex-col min-h-0">
            {/* Locations Header + Filter Buttons */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Locations</h3>
                  <p className="text-xs text-muted-foreground">
                    Filter shops by city
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] px-2 py-1">
                  {filteredShops.length} shops
                </Badge>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1.5">
                {locations.map((location) => (
                  <Button
                    key={location}
                    variant={selectedLocation === location ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLocation(location)}
                    className={`whitespace-nowrap ${selectedLocation === location
                      ? "bg-[#FF6600] text-white hover:bg-[#E65C00]"
                      : ""
                      }`}
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Shop Count */}
            <div className="text-xs text-muted-foreground mb-2">
              {filteredShops.length} shop{filteredShops.length !== 1 ? "s" : ""} found
            </div>

            {/* Shop List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
              {filteredShops.map((shop) => {
                const isActive = selectedShop?.id === shop.id;
                return (
                  <Card
                    key={shop.id}
                    className={`p-3 cursor-pointer transition-all hover:shadow-md ${isActive
                      ? "ring-2 ring-[#FF6600] bg-orange-50 border-[#FF6600]"
                      : "border-border"
                      }`}
                    onClick={() => setSelectedShop(shop)}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={shop.image}
                          alt={shop.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[13px] mb-0.5 truncate">{shop.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-[#FF6600] text-white text-[10px] px-2 py-0.5 rounded-full">
                            {shop.status}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">
                            {shop.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[11px] font-medium">{shop.rating}</span>
                          <span className="text-[11px] text-muted-foreground">
                            ({shop.reviews} reviews)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{shop.address}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mb-1.5">
                          {shop.distance > 0 ? `${shop.distance} km away` : shop.location}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-[11px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShop(shop);
                          }}
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Panel - Map */}
        <div className="flex flex-col min-h-0 h-full">
          <Card className="p-4 flex-1 flex flex-col min-h-0 relative h-full">
            {/* Map Search */}
            <div className="absolute top-6 right-6 z-[1000] w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Q Search shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/95 backdrop-blur"
                />
              </div>
            </div>

            {/* Shop Count */}
            <div className="absolute top-6 left-6 z-[1000] bg-white/95 backdrop-blur px-3 py-1.5 rounded-md text-sm font-medium shadow-sm">
              {filteredShops.length} shops found
            </div>

            {/* Map */}
            <div className="flex-1 rounded-lg overflow-hidden relative h-full min-h-[600px]">
              {typeof window !== "undefined" && (
                <MapContainer
                  center={center}
                  zoom={selectedShop ? 15 : 13}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                  key={selectedShop?.id || "default"}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredShops.map((shop) => {
                    const isSelected = selectedShop?.id === shop.id;
                    return (
                      <Marker
                        key={shop.id}
                        position={shop.coordinates}
                        icon={isSelected && selectedIcon ? selectedIcon : defaultIcon}
                        eventHandlers={{
                          click: () => setSelectedShop(shop),
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-semibold text-sm mb-1">{shop.name}</h3>
                            <Badge variant="secondary" className="text-xs mb-2">
                              {shop.category}
                            </Badge>
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">{shop.rating} ({shop.reviews})</span>
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {shop.address}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              {shop.distance > 0 ? `${shop.distance} km away` : shop.location}
                            </div>
                            <div className="text-xs text-muted-foreground mb-3">
                              <Phone className="w-3 h-3 inline mr-1" />
                              {shop.phone}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="text-xs bg-[#FF6600] text-white hover:bg-[#E65C00] flex-1"
                                onClick={() => {
                                  window.open(
                                    `https://www.google.com/maps/dir/?api=1&destination=${shop.coordinates[0]},${shop.coordinates[1]}`,
                                    "_blank"
                                  );
                                }}
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Directions
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs flex-1"
                                onClick={() => {
                                  window.location.href = `tel:${shop.phone}`;
                                }}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              )}

              {/* Selected shop details card (overlay on map) */}
              {selectedShop && (
                <div className="absolute bottom-6 left-6 z-[1000] max-w-sm">
                  <Card className="p-4 shadow-xl">
                    <div className="flex gap-3">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={selectedShop.image}
                          alt={selectedShop.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">
                            {selectedShop.name}
                          </h3>
                          <Badge className="bg-[#FF6600] text-white text-[10px] px-2 py-0.5">
                            {selectedShop.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{selectedShop.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({selectedShop.reviews} reviews)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{selectedShop.address}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {selectedShop.distance > 0
                            ? `${selectedShop.distance} km away`
                            : selectedShop.location}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          <Phone className="w-3 h-3 inline mr-1" />
                          {selectedShop.phone}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="text-xs bg-[#FF6600] text-white hover:bg-[#E65C00] flex-1"
                            onClick={() => {
                              window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${selectedShop.coordinates[0]},${selectedShop.coordinates[1]}`,
                                "_blank"
                              );
                            }}
                          >
                            <Navigation className="w-3 h-3 mr-1" />
                            Get Directions
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs flex-1"
                            onClick={() => {
                              window.location.href = `tel:${selectedShop.phone}`;
                            }}
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg z-[1000] text-xs">
                <div className="font-semibold mb-2">Legend</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF6600]"></div>
                    <span>Simba Branch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF6600] ring-2 ring-[#FF6600] ring-offset-1"></div>
                    <span>Selected Branch</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

