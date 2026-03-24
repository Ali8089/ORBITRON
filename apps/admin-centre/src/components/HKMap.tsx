'use client'

import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import Map, { Marker, Source, Layer, NavigationControl, FullscreenControl } from 'react-map-gl'
import type { FillExtrusionLayer, FillLayer } from 'react-map-gl'
import { getMapboxToken } from '../../../shared/mapboxToken'

const MAPBOX_TOKEN = getMapboxToken()

interface Drone {
  id: string
  lat: number
  lng: number
  altitude: number
  status: string
}

interface HKMapProps {
  drones: Drone[]
  showBands: boolean[]
  showNoGo: boolean
  showPrivacy: boolean
}

const buildingsLayer: FillExtrusionLayer = {
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 10,
  paint: {
    'fill-extrusion-color': '#1e3a5f',
    'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 10, 0, 15, ['get', 'height']],
    'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 10, 0, 15, ['get', 'min_height']],
    'fill-extrusion-opacity': 0.7,
  },
}

const noGoZoneData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'HKIA Restricted Zone' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[113.91, 22.30], [113.95, 22.30], [113.95, 22.33], [113.91, 22.33], [113.91, 22.30]]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'PLA Base North' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[114.17, 22.33], [114.19, 22.33], [114.19, 22.35], [114.17, 22.35], [114.17, 22.33]]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Stanley Prison' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[114.21, 22.21], [114.23, 22.21], [114.23, 22.23], [114.21, 22.23], [114.21, 22.21]]],
      },
    },
  ],
}

const noGoFillLayer: FillLayer = {
  id: 'no-go-fill',
  type: 'fill',
  source: 'no-go-zones',
  paint: {
    'fill-color': '#ef4444',
    'fill-opacity': 0.25,
  },
}

const privacyZoneData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Residential Towers - Tseung Kwan O' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[114.20, 22.30], [114.22, 22.30], [114.22, 22.32], [114.20, 22.32], [114.20, 22.30]]],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Residential - Sha Tin' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[114.19, 22.37], [114.21, 22.37], [114.21, 22.39], [114.19, 22.39], [114.19, 22.37]]],
      },
    },
  ],
}

const privacyFillLayer: FillLayer = {
  id: 'privacy-fill',
  type: 'fill',
  source: 'privacy-zones',
  paint: {
    'fill-color': '#ec4899',
    'fill-opacity': 0.2,
  },
}

const BAND_COLORS = ['#bfdbfe', '#60a5fa', '#2563eb', '#1e40af', '#3730a3']

export default function HKMap({ drones, showBands, showNoGo, showPrivacy }: HKMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 114.1694,
    latitude: 22.3193,
    zoom: 12,
    pitch: 45,
    bearing: -17,
  })

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      style={{ width: '100%', height: '100%' }}
    >
      <NavigationControl position="top-right" />
      <FullscreenControl position="top-right" />

      {/* 3D Buildings */}
      <Layer {...buildingsLayer} />

      {/* NO-GO Zones */}
      {showNoGo && (
        <Source id="no-go-zones" type="geojson" data={noGoZoneData}>
          <Layer {...noGoFillLayer} />
        </Source>
      )}

      {/* Privacy Zones */}
      {showPrivacy && (
        <Source id="privacy-zones" type="geojson" data={privacyZoneData}>
          <Layer {...privacyFillLayer} />
        </Source>
      )}

      {/* Drone Markers */}
      {drones.map(drone => (
        <Marker key={drone.id} longitude={drone.lng} latitude={drone.lat} anchor="center">
          <div
            title={`${drone.id} | Alt: ${drone.altitude}m | ${drone.status}`}
            className="w-3 h-3 rounded-full border-2 border-white cursor-pointer transition-transform hover:scale-150"
            style={{
              backgroundColor: drone.status === 'rogue' ? '#ef4444' : drone.status === 'warning' ? '#f59e0b' : '#22c55e',
              boxShadow: drone.status === 'rogue' ? '0 0 8px #ef4444' : '0 0 4px rgba(34,197,94,0.5)',
            }}
          />
        </Marker>
      ))}

      {/* Altitude Band Legend Overlay */}
      <div className="absolute bottom-8 left-4 bg-black/70 rounded-lg p-3 space-y-1">
        <p className="text-xs text-white font-semibold mb-2">Altitude Bands</p>
        {BAND_COLORS.map((color, i) => (
          showBands[i] && (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-2 rounded-sm opacity-80" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate-300">Band {i}: {i * 80}–{(i + 1) * 80}m</span>
            </div>
          )
        ))}
      </div>
    </Map>
  )
}
