"use client";

import { useEffect, useMemo } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { divIcon, type DragEndEvent, type LeafletMouseEvent, type Marker as LeafletMarker } from "leaflet";

interface Props { latitude: number; longitude: number; radiusMiles: number; onChange(latitude: number, longitude: number): void }

function Recenter({ latitude, longitude }: Pick<Props, "latitude" | "longitude">) {
  const map = useMap();
  useEffect(() => { map.setView([latitude, longitude]); }, [latitude, longitude, map]);
  return null;
}

function ClickHandler({ onChange }: Pick<Props, "onChange">) {
  useMapEvents({ click(event: LeafletMouseEvent) { onChange(event.latlng.lat, event.latlng.lng); } });
  return null;
}

export default function LocationPickerMap({ latitude, longitude, radiusMiles, onChange }: Props) {
  const markerIcon = useMemo(() => divIcon({ className: "map-marker map-marker--donor", html: "<span></span>", iconSize: [28, 28], iconAnchor: [14, 14] }), []);
  return (
    <MapContainer center={[latitude, longitude]} zoom={12} className="location-map" scrollWheelZoom>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Circle center={[latitude, longitude]} radius={radiusMiles * 1609.344} pathOptions={{ color: "#2f8f46", fillColor: "#65a832", fillOpacity: 0.08, weight: 2 }} />
      <Marker position={[latitude, longitude]} icon={markerIcon} draggable eventHandlers={{ dragend(event: DragEndEvent) { const point = (event.target as LeafletMarker).getLatLng(); onChange(point.lat, point.lng); } }} />
      <ClickHandler onChange={onChange} />
      <Recenter latitude={latitude} longitude={longitude} />
    </MapContainer>
  );
}
