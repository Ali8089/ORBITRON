'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const HKMap = dynamic(() => import('../components/HKMap'), { ssr: false })

const API = 'http://localhost:4000/api/v1'

interface Drone {
  id: string
  lat: number
  lng: number
  altitude: number
  status: string
  band?: number
}

interface BlockchainEvent {
  id: string
  type: string
  payload: Record<string, unknown>
  txHash: string
  blockHeight: number
  timestamp: string
}

interface BlockchainStats {
  tpsEstimate: number
  blockHeight: number
  totalEvents: number
  lastBlockTime: string
}

const MOCK_DRONES: Drone[] = [
  { id: 'DRN-001', lat: 22.3193, lng: 114.1694, altitude: 120, status: 'active', band: 1 },
  { id: 'DRN-002', lat: 22.295, lng: 114.175, altitude: 200, status: 'active', band: 2 },
  { id: 'DRN-003', lat: 22.340, lng: 114.195, altitude: 80, status: 'active', band: 0 },
  { id: 'DRN-004', lat: 22.308, lng: 114.161, altitude: 160, status: 'warning', band: 2 },
  { id: 'DRN-005', lat: 22.325, lng: 114.212, altitude: 280, status: 'active', band: 3 },
]

const EVENT_TYPE_COLORS: Record<string, string> = {
  FLIGHT_APPROVED: 'text-green-400',
  CREDIT_TRANSACTION: 'text-yellow-400',
  SAFETY_EVENT: 'text-red-400',
  PRIVACY_COMPLIANCE: 'text-pink-400',
  TELEMETRY_ANCHOR: 'text-blue-400',
}

export default function AdminCentre() {
  const [drones, setDrones] = useState<Drone[]>(MOCK_DRONES)
  const [showBands, setShowBands] = useState([true, true, true, true, true])
  const [showNoGo, setShowNoGo] = useState(true)
  const [showPrivacy, setShowPrivacy] = useState(true)
  const [events, setEvents] = useState<BlockchainEvent[]>([])
  const [stats, setStats] = useState<BlockchainStats>({
    tpsEstimate: 1.5,
    blockHeight: 847,
    totalEvents: 10,
    lastBlockTime: new Date().toISOString(),
  })
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchDrones()
    fetchEvents()
    fetchStats()

    const droneInterval = setInterval(fetchDrones, 5000)
    const eventInterval = setInterval(() => {
      fetchEvents()
      fetchStats()
    }, 5000)

    return () => {
      clearInterval(droneInterval)
      clearInterval(eventInterval)
    }
  }, [])

  async function fetchDrones() {
    try {
      const res = await fetch(`${API}/simulator/drones`)
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) setDrones(data)
      }
    } catch {
      // Keep mock drones
    }
  }

  async function fetchEvents() {
    try {
      const res = await fetch(`${API}/blockchain/events`)
      if (res.ok) {
        const data = await res.json()
        setEvents(data.slice(0, 10))
      }
    } catch {
      // Keep existing
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API}/blockchain/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setLastUpdated(new Date())
      }
    } catch {
      setLastUpdated(new Date())
    }
  }

  function toggleBand(i: number) {
    setShowBands(prev => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  const bandColors = [
    'bg-blue-200', 'bg-blue-400', 'bg-blue-600', 'bg-blue-800', 'bg-indigo-900',
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                ORBITRON UTM <span className="text-blue-400">–</span> Admin Centre
              </h1>
              <p className="text-xs text-slate-400">Hong Kong Airspace Management · Real-time UTM Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Active Drones:</span>
            <span className="text-xl font-bold text-green-400">{drones.filter(d => d.status !== 'rogue').length}</span>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col overflow-y-auto flex-shrink-0">
          <div className="p-4 space-y-5">

            {/* Altitude Bands */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Altitude Bands</h3>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map(i => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={showBands[i]}
                      onChange={() => toggleBand(i)}
                      className="rounded"
                    />
                    <div className={`w-4 h-4 rounded ${bandColors[i]} opacity-80`} />
                    <span className="text-sm text-slate-300 group-hover:text-white">
                      Band {i}: {i * 80}–{(i + 1) * 80}m
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* NO-GO Zones */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">NO-GO Zones</h3>
              <div className="space-y-2">
                {['HKIA', 'PLA Bases', 'Prisons'].map(zone => (
                  <label key={zone} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNoGo}
                      onChange={() => setShowNoGo(v => !v)}
                      className="rounded"
                    />
                    <div className="w-4 h-4 rounded bg-red-500 opacity-70" />
                    <span className="text-sm text-slate-300">{zone}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Privacy Zones */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Privacy Zones</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrivacy}
                  onChange={() => setShowPrivacy(v => !v)}
                  className="rounded"
                />
                <div className="w-4 h-4 rounded bg-pink-500 opacity-70" />
                <span className="text-sm text-slate-300">Residential Towers</span>
              </label>
            </div>

            {/* Weather Widget */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1">
                  🌤 HKO Weather
                </h3>
                <button
                  onClick={() => setLastUpdated(new Date())}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  ↻
                </button>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Temperature</span>
                  <span className="text-white font-medium">24°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Wind</span>
                  <span className="text-white font-medium">NE 15 km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Humidity</span>
                  <span className="text-white font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Visibility</span>
                  <span className="text-white font-medium">8 km</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            </div>

            {/* Blockchain Stats */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1">
                  ⛓ Blockchain Stats
                </h3>
                <button
                  onClick={fetchStats}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  ↻
                </button>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">TPS</span>
                  <span className="text-green-400 font-bold">{stats.tpsEstimate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Block Height</span>
                  <span className="text-blue-400 font-bold">{stats.blockHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Events</span>
                  <span className="text-white font-medium">{stats.totalEvents}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Map Area */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <HKMap
              drones={drones}
              showBands={showBands}
              showNoGo={showNoGo}
              showPrivacy={showPrivacy}
            />
          </div>

          {/* Bottom Event Feed */}
          <div className="bg-slate-900 border-t border-slate-700 h-48 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="text-blue-400">⛓</span> Blockchain Event Feed
              </h3>
              <span className="text-xs text-slate-500">Live · refreshes every 5s</span>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 font-mono text-xs">
              {events.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Waiting for events...</p>
              ) : (
                events.map(event => (
                  <div key={event.id} className="flex items-center gap-3 py-0.5">
                    <span className="text-slate-500 flex-shrink-0">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    <span className={`flex-shrink-0 font-semibold ${EVENT_TYPE_COLORS[event.type] || 'text-slate-300'}`}>
                      {event.type}
                    </span>
                    <span className="text-slate-400">Block #{event.blockHeight}</span>
                    <span className="text-slate-500 truncate">TX: {event.txHash.slice(0, 16)}...</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
