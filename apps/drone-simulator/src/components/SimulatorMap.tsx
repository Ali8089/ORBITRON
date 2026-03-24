'use client'

import 'mapbox-gl/dist/mapbox-gl.css'
import { useState, useEffect } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl'
import { getMapboxToken } from '../../../shared/mapboxToken'

const MAPBOX_TOKEN = getMapboxToken()

interface Drone {
  id: string
  lat: number
  lng: number
  altitude: number
  status: string
  heading?: number
  speed?: number
  band?: number
}

interface SimulatorMapProps {
  drones: Drone[]
}

export default function SimulatorMap({ drones }: SimulatorMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 114.1694,
    latitude: 22.3193,
    zoom: 12,
    pitch: 40,
    bearing: -10,
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

      {drones.map(drone => (
        <Marker key={drone.id} longitude={drone.lng} latitude={drone.lat} anchor="center">
          <div className="relative" title={`${drone.id} | ${drone.altitude}m | ${drone.status}`}>
            {drone.status === 'rogue' ? (
              <div className="relative flex items-center justify-center">
                <div
                  className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-300 z-10"
                  style={{ boxShadow: '0 0 12px #ef4444, 0 0 24px #ef4444' }}
                />
                <div
                  className="absolute w-5 h-5 rounded-full bg-red-500 opacity-50"
                  style={{ animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }}
                />
              </div>
            ) : (
              <div
                className="w-3 h-3 rounded-full border border-white/50"
                style={{
                  backgroundColor: drone.status === 'warning' ? '#f59e0b' : '#22c55e',
                  boxShadow: `0 0 4px ${drone.status === 'warning' ? '#f59e0b' : '#22c55e'}`,
                }}
              />
            )}
          </div>
        </Marker>
      ))}
    </Map>
  )
}
