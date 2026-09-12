"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";
import type { AiSearchMatch } from "@/types/match";

export default function MatchMap({ latitude, longitude, matches, onSelect }: { latitude: number; longitude: number; matches: AiSearchMatch[]; onSelect(match: AiSearchMatch): void }) {
  const icons = useMemo(() => ({
    donor: divIcon({ className: "map-marker map-marker--donor", html: "<span></span>", iconSize: [28, 28], iconAnchor: [14, 14] }),
    best: divIcon({ className: "map-marker map-marker--best", html: "<span>1</span>", iconSize: [34, 34], iconAnchor: [17, 17] }),
    other: divIcon({ className: "map-marker map-marker--match", html: "<span></span>", iconSize: [28, 28], iconAnchor: [14, 14] }),
  }), []);
  const bounds: [[number, number], [number, number]] | undefined = matches.length ? [[Math.min(latitude, ...matches.map((match) => match.latitude)), Math.min(longitude, ...matches.map((match) => match.longitude))], [Math.max(latitude, ...matches.map((match) => match.latitude)), Math.max(longitude, ...matches.map((match) => match.longitude))]] : undefined;
  return (
    <MapContainer center={[latitude, longitude]} zoom={12} bounds={bounds} boundsOptions={{ padding: [35, 35] }} className="match-map">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]} icon={icons.donor}><Popup>Donation pickup location</Popup></Marker>
      {matches.map((match, index) => <Marker key={match.id} position={[match.latitude, match.longitude]} icon={index === 0 ? icons.best : icons.other}><Popup><strong>{match.name}</strong><br />{match.matchScore}% match · {match.distanceMiles} miles<br />Need urgency: {match.urgency}/100<br />Capacity: {match.availableCapacity} lbs<br /><button type="button" className="map-popup-action" onClick={() => onSelect(match)}>Select organization</button></Popup></Marker>)}
    </MapContainer>
  );
}
