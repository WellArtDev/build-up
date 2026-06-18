declare module 'leaflet' {
  export function map(element: HTMLElement | string, options?: Record<string, unknown>): Map;
  export function tileLayer(urlTemplate: string, options?: Record<string, unknown>): TileLayer;
  export function latLngBounds(latlngs: LatLng[]): LatLngBounds;
  export function marker(latlng: LatLngExpression, options?: Record<string, unknown>): Marker;

  export interface Map {
    setView(center: LatLngExpression, zoom: number): this;
    addLayer(layer: Layer): this;
    remove(): void;
    fitBounds(bounds: LatLngBounds, options?: Record<string, unknown>): this;
  }

  export interface TileLayer extends Layer {
    addTo(map: Map): this;
  }
  export interface Layer {}
  export interface LatLngBounds {
    extend(latlng: LatLngExpression): this;
  }

  export interface LatLng {
    lat: number;
    lng: number;
  }

  export type LatLngExpression = [number, number] | LatLng;

  export interface Marker extends Layer {
    addTo(map: Map): this;
    bindPopup(html: string): this;
  }

  export interface IconOptions {
    iconUrl?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
  }

  export function icon(options: IconOptions): Record<string, unknown>;

  export default {
    map,
    tileLayer,
    latLngBounds,
    marker,
    icon,
  };
}
