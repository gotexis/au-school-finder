"use client";

import { useEffect, useState } from "react";
import type { School } from "@/lib/schools";

interface MapViewProps {
  schools: {
    name: string;
    slug: string;
    latitude: number | null;
    longitude: number | null;
    suburb: string;
    state: string;
    icsea: number | null;
    type: string;
    sector: string;
    enrolments: { total: number | null };
  }[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function MapView({ schools, center, zoom, height = "400px" }: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ height }} className="rounded-xl bg-base-300 animate-pulse flex items-center justify-center">
        <span className="text-base-content/50">Loading map…</span>
      </div>
    );
  }

  return <MapInner schools={schools} center={center} zoom={zoom} height={height} />;
}

function MapInner({ schools, center, zoom, height }: MapViewProps & { height: string }) {
  const [L, setL] = useState<typeof import("react-leaflet") | null>(null);
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    Promise.all([import("react-leaflet"), import("leaflet")]).then(([rl, lf]) => {
      // Fix default marker icons
      delete (lf.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      lf.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setL(rl);
      setLeaflet(lf);
    });
  }, []);

  if (!L || !leaflet) {
    return (
      <div style={{ height }} className="rounded-xl bg-base-300 animate-pulse flex items-center justify-center">
        <span className="text-base-content/50">Loading map…</span>
      </div>
    );
  }

  const validSchools = schools.filter((s) => s.latitude && s.longitude);
  if (validSchools.length === 0) return null;

  // Calculate center if not provided
  const mapCenter: [number, number] = center || [
    validSchools.reduce((a, s) => a + s.latitude!, 0) / validSchools.length,
    validSchools.reduce((a, s) => a + s.longitude!, 0) / validSchools.length,
  ];
  const mapZoom = zoom || (validSchools.length === 1 ? 14 : 12);

  const { MapContainer, TileLayer, Marker, Popup } = L;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height, width: "100%" }}
        className="rounded-xl z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validSchools.map((s) => (
          <Marker key={s.slug} position={[s.latitude!, s.longitude!]}>
            <Popup>
              <div className="text-sm">
                <a href={`/school/${s.slug}`} className="font-bold text-primary hover:underline">
                  {s.name}
                </a>
                <div className="text-xs mt-1">
                  {s.suburb}, {s.state} · {s.type} · {s.sector}
                </div>
                {s.icsea && <div className="text-xs">ICSEA: <strong>{s.icsea}</strong></div>}
                {s.enrolments.total && <div className="text-xs">Students: {s.enrolments.total.toLocaleString()}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
