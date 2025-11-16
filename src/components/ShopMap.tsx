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

// Shop data with coordinates (Kigali, Rwanda)
const shops = [
  {
    id: 1,
    name: "Green Valley Market",
    category: "Grocery",
    rating: 4.8,
    reviews: 234,
    address: "KN 4 Ave, Kigali",
    distance: 0.5,
    phone: "+250 788 123 456",
    image: "/shop.png",
    coordinates: [-1.9441, 30.0619] as [number, number],
    location: "Kigali"
  },
  {
    id: 2,
    name: "Tech Hub Electronics",
    category: "Electronics",
    rating: 4.6,
    reviews: 851,
    address: "KG 11 Ave, Kigali",
    distance: 1.2,
    phone: "+250 788 234 567",
    image: "/shop.png",
    coordinates: [-1.9503, 30.0584] as [number, number],
    location: "Kigali"
  },
  {
    id: 3,
    name: "Fashion Forward Boutique",
    category: "Fashion",
    rating: 4.9,
    reviews: 312,
    address: "KN 3 Rd, Kigali",
    distance: 0.8,
    phone: "+250 788 345 678",
    image: "/shop.png",
    coordinates: [-1.9396, 30.0644] as [number, number],
    location: "Kigali"
  },
  {
    id: 4,
    name: "Home & Garden Essentials",
    category: "Home & Garden",
    rating: 4.5,
    reviews: 560,
    address: "KG 7 Ave, Kigali",
    distance: 2.1,
    phone: "+250 788 456 789",
    image: "/shop.png",
    coordinates: [-1.9458, 30.0555] as [number, number],
    location: "Kigali"
  },
  {
    id: 5,
    name: "Sports Arena",
    category: "Sports",
    rating: 4.4,
    reviews: 98,
    address: "KG 9 Ave, Kigali",
    distance: 1.7,
    phone: "+250 788 567 890",
    image: "/shop.png",
    coordinates: [-1.9489, 30.0522] as [number, number],
    location: "Kigali"
  },
  {
    id: 6,
    name: "Musanze Market",
    category: "Grocery",
    rating: 4.3,
    reviews: 145,
    address: "Main St, Musanze",
    distance: 0.0,
    phone: "+250 788 678 901",
    image: "/shop.png",
    coordinates: [-1.5036, 29.6344] as [number, number],
    location: "Musanze"
  },
  {
    id: 7,
    name: "Muhanga Central",
    category: "General",
    rating: 4.2,
    reviews: 203,
    address: "Center St, Muhanga",
    distance: 0.0,
    phone: "+250 788 789 012",
    image: "/shop.png",
    coordinates: [-2.0833, 29.7500] as [number, number],
    location: "Muhanga"
  },
  {
    id: 8,
    name: "Huye Plaza",
    category: "Shopping",
    rating: 4.6,
    reviews: 178,
    address: "Market Rd, Huye",
    distance: 0.0,
    phone: "+250 788 890 123",
    image: "/shop.png",
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

        // Selected icon (larger green marker)
        const selectedIconInstance = L.divIcon({
          className: 'custom-selected-marker',
          html: `<div style="
            width: 32px;
            height: 32px;
            background-color: #22c55e;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
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
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-1">Shop Locations</h2>
        <p className="text-sm text-muted-foreground">Interactive map showing all shop locations</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 h-full">
        {/* Left Panel - Shop List */}
        <div className="flex flex-col min-h-0">
          <Card className="p-4 flex-1 flex flex-col min-h-0">
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {locations.map((location) => (
                <Button
                  key={location}
                  variant={selectedLocation === location ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLocation(location)}
                  className={`whitespace-nowrap ${
                    selectedLocation === location
                      ? "bg-success text-white hover:bg-success/90"
                      : ""
                  }`}
                >
                  {location}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Shop Count */}
            <div className="text-sm text-muted-foreground mb-3">
              {filteredShops.length} shop{filteredShops.length !== 1 ? "s" : ""} found
            </div>

            {/* Shop List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {filteredShops.map((shop) => {
                const isActive = selectedShop?.id === shop.id;
                return (
                <Card
                  key={shop.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    isActive
                      ? "ring-2 ring-success bg-success/10 border-success"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedShop(shop)}
                >
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={shop.image}
                        alt={shop.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 truncate">{shop.name}</h3>
                      <Badge variant="secondary" className="text-xs mb-2">
                        {shop.category}
                      </Badge>
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{shop.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({shop.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{shop.address}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {shop.distance > 0 ? `${shop.distance} km away` : shop.location}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
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
                              className="text-xs bg-success text-white hover:bg-success/90 flex-1"
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

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg z-[1000] text-xs">
                <div className="font-semibold mb-2">Legend</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span>Shop Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success ring-2 ring-success ring-offset-1"></div>
                    <span>Selected Shop</span>
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

