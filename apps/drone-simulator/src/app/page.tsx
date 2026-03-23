'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const SimulatorMap = dynamic(() => import('../components/SimulatorMap'), { ssr: false })

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

interface Drone {
  id: string
  lat: number
  lng: number
  altitude: number
  status: string
  heading?: number
  speed?: number
  band?: number
  operatorId?: string
}

interface RogueIncident {
  drone: Drone
  incident: {
    id: string
    type: string
    droneId: string
    txHash: string
    blockHeight: number
    timestamp: string
    threat: string
    location: { lat: number; lng: number }
  }
}

interface AgentMessage {
  id: string
  text: string
  type: 'info' | 'warning' | 'credit' | 'success' | 'danger'
  timestamp: Date
}

const COUNTER_MEASURES = [
  { method: 'RF Jamming', cost: 'HK$800' },
  { method: 'Laser Dazzler', cost: 'HK$12,000' },
  { method: 'Net Gun System', cost: 'HK$45,000' },
  { method: 'Patriot Missile', cost: 'HK$23,000,000' },
]

function genMockDrones(count: number): Drone[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `DRN-${String(i + 1).padStart(3, '0')}`,
    lat: 22.28 + Math.random() * 0.07,
    lng: 114.15 + Math.random() * 0.07,
    altitude: Math.floor(Math.random() * 320) + 40,
    heading: Math.floor(Math.random() * 360),
    speed: Math.floor(Math.random() * 50) + 10,
    status: 'active',
    band: Math.floor(Math.random() * 5),
    operatorId: `op-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
  }))
}

function randomMsg(drones: Drone[]): AgentMessage {
  const types: AgentMessage['type'][] = ['info', 'warning', 'credit', 'success']
  const type = types[Math.floor(Math.random() * types.length)]
  const drone1 = drones[Math.floor(Math.random() * drones.length)]
  const drone2 = drones[Math.floor(Math.random() * drones.length)]
  const separation = Math.floor(Math.random() * 200) + 50
  const credits = Math.floor(Math.random() * 5) + 1
  const balance = Math.floor(Math.random() * 45) + 5
  const band = Math.floor(Math.random() * 5)

  const messages: Record<AgentMessage['type'], string> = {
    warning: `⚠️ CAUTION: ${drone1?.id} – ${separation}m separation from ${drone2?.id}`,
    success: `✅ ${drone1?.id}: Route cleared, Band ${band}`,
    credit: `💰 ${drone1?.id}: Credit charged: ${credits} credits (balance: ${balance})`,
    info: `📡 ${drone1?.id}: Telemetry anchored to block #${Math.floor(Math.random() * 100) + 850}`,
    danger: `🚨 ROGUE DRONE DETECTED near ${drone1?.lat?.toFixed(4)}, ${drone1?.lng?.toFixed(4)}`,
  }

  return {
    id: `msg-${Date.now()}-${Math.random()}`,
    text: messages[type],
    type,
    timestamp: new Date(),
  }
}

export default function DroneSimulator() {
  const [drones, setDrones] = useState<Drone[]>([])
  const [credits, setCredits] = useState(50)
  const [rogueIncident, setRogueIncident] = useState<RogueIncident | null>(null)
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
    { id: 'init-1', text: '🟢 System online. Awaiting drone launch.', type: 'info', timestamp: new Date() },
    { id: 'init-2', text: '📡 Blockchain node connected: Block #847', type: 'info', timestamp: new Date() },
  ])
  const [clock, setClock] = useState(new Date())
  const feedRef = useRef<HTMLDivElement>(null)

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Animate drones
  useEffect(() => {
    if (drones.length === 0) return
    const t = setInterval(() => {
      setDrones(prev =>
        prev.map(d => ({
          ...d,
          lat: Math.max(22.28, Math.min(22.35, d.lat + (Math.random() - 0.5) * 0.001)),
          lng: Math.max(114.15, Math.min(114.22, d.lng + (Math.random() - 0.5) * 0.001)),
          heading: ((d.heading || 0) + Math.floor(Math.random() * 6) - 3 + 360) % 360,
        }))
      )
    }, 2000)
    return () => clearInterval(t)
  }, [drones.length])

  // Random agent messages
  useEffect(() => {
    if (drones.length === 0) return
    const t = setInterval(() => {
      const msg = randomMsg(drones)
      setAgentMessages(prev => [msg, ...prev].slice(0, 100))
      if (msg.type === 'credit') {
        setCredits(c => Math.max(0, c - (Math.floor(Math.random() * 3) + 1)))
      }
      if (feedRef.current) feedRef.current.scrollTop = 0
    }, 1500)
    return () => clearInterval(t)
  }, [drones])

  async function handleLaunch() {
    try {
      const res = await fetch(`${API}/simulator/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 50 }),
      })
      if (res.ok) {
        const launched: Drone[] = await res.json()
        setDrones(launched)
        addMessage(`🚀 ${launched.length} drones launched into Hong Kong airspace`, 'success')
        return
      }
    } catch {
      // fallback
    }
    const mock = genMockDrones(50)
    setDrones(mock)
    addMessage(`🚀 50 drones launched (mock mode) into Hong Kong airspace`, 'success')
  }

  async function handleRogue() {
    try {
      const res = await fetch(`${API}/simulator/rogue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const data: RogueIncident = await res.json()
        setRogueIncident(data)
        setDrones(prev => [...prev, data.drone])
        addMessage(`🚨 ROGUE DRONE ${data.drone.id} injected at ${data.drone.lat.toFixed(4)}, ${data.drone.lng.toFixed(4)}`, 'danger')
        return
      }
    } catch {
      // fallback
    }
    const rogueId = `ROGUE-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    const txHash = Array.from({ length: 16 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
    const rogueData: RogueIncident = {
      drone: {
        id: rogueId,
        lat: 22.305 + Math.random() * 0.02,
        lng: 114.175 + Math.random() * 0.02,
        altitude: 150,
        status: 'rogue',
        band: -1,
        operatorId: 'UNKNOWN',
      },
      incident: {
        id: `inc-${Date.now()}`,
        type: 'ROGUE_DRONE_DETECTED',
        droneId: rogueId,
        txHash,
        blockHeight: 850 + Math.floor(Math.random() * 50),
        timestamp: new Date().toISOString(),
        threat: 'CRITICAL',
        location: { lat: 22.305, lng: 114.175 },
      },
    }
    setRogueIncident(rogueData)
    setDrones(prev => [...prev, rogueData.drone])
    addMessage(`🚨 ROGUE DRONE ${rogueId} injected (mock mode)`, 'danger')
  }

  async function handleClear() {
    try {
      await fetch(`${API}/simulator/drones`, { method: 'DELETE' })
    } catch { /* ignore */ }
    setDrones([])
    setRogueIncident(null)
    addMessage('🛑 All drones cleared from airspace', 'info')
  }

  function addMessage(text: string, type: AgentMessage['type']) {
    setAgentMessages(prev => [
      { id: `msg-${Date.now()}`, text, type, timestamp: new Date() },
      ...prev,
    ].slice(0, 100))
  }

  const msgColor: Record<AgentMessage['type'], string> = {
    info: 'text-blue-300',
    warning: 'text-yellow-300',
    credit: 'text-green-300',
    success: 'text-emerald-300',
    danger: 'text-red-300',
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚁</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                ORBITRON UTM <span className="text-blue-400">–</span> Drone Simulator
              </h1>
              <p className="text-xs text-slate-400">Hong Kong Tactical Airspace Simulation</p>
            </div>
          </div>
          <div className="font-mono text-slate-300 text-sm">{clock.toLocaleTimeString()}</div>
        </div>
      </header>

      {/* Control Bar */}
      <div className="bg-slate-900/80 border-b border-slate-700 px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <button
          onClick={handleLaunch}
          className="bg-green-700 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          🚀 Launch 50 Drones
        </button>
        <button
          onClick={handleRogue}
          className="bg-red-700 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
        >
          ⚠️ Inject Rogue Drone
        </button>
        <button
          onClick={handleClear}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
        >
          🛑 Clear All
        </button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-400">Active Drones:</span>
          <span className="text-2xl font-bold text-green-400">{drones.filter(d => d.status !== 'rogue').length}</span>
          {drones.some(d => d.status === 'rogue') && (
            <span className="text-xs bg-red-900/50 text-red-300 border border-red-700/50 px-2 py-0.5 rounded-full animate-pulse">
              ⚠ ROGUE DETECTED
            </span>
          )}
        </div>
      </div>

      {/* Rogue Alert Banner */}
      {rogueIncident && (
        <div className="bg-red-950 border-b border-red-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-red-300 font-bold text-sm mb-2">
                🚨 CRITICAL THREAT DETECTED – Rogue Drone in Restricted Airspace
              </p>
              <p className="text-xs text-red-400 mb-3">Counter-measure cost comparison:</p>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {COUNTER_MEASURES.map(cm => (
                  <div key={cm.method} className="bg-red-900/40 border border-red-700/40 rounded px-3 py-2 text-center">
                    <p className="text-xs text-red-300 font-semibold">{cm.method}</p>
                    <p className="text-sm font-bold text-white mt-1">{cm.cost}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Blockchain incident record created: TX #{rogueIncident.incident.txHash.slice(0, 16)}...
              </p>
            </div>
            <button
              onClick={() => setRogueIncident(null)}
              className="ml-4 text-red-400 hover:text-white text-xl flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <SimulatorMap drones={drones} />
          {drones.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 pointer-events-none">
              <div className="text-center">
                <p className="text-4xl mb-3">🚁</p>
                <p className="text-xl font-semibold text-slate-300">No drones in airspace</p>
                <p className="text-sm text-slate-500 mt-1">Click &quot;Launch 50 Drones&quot; to begin simulation</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Tactical Agent Feed */}
        <aside className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              📡 Tactical Agent Feed
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">Credit Balance:</span>
              <span className="text-sm font-bold text-blue-400">{credits}</span>
              <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${credits * 2}%` }}
                />
              </div>
            </div>
          </div>

          <div ref={feedRef} className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs">
            {agentMessages.map(msg => (
              <div key={msg.id} className={`${msgColor[msg.type]} leading-relaxed`}>
                <span className="text-slate-600">{msg.timestamp.toLocaleTimeString()} </span>
                {msg.text}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Bottom Stats */}
      <div className="bg-slate-900 border-t border-slate-700 px-6 py-3 flex items-center gap-8 flex-shrink-0">
        {[
          { label: 'Total Flights Today', value: 247, color: 'text-blue-400' },
          { label: 'Conflicts Detected', value: 12, color: 'text-yellow-400' },
          { label: 'Conflicts Resolved', value: 11, color: 'text-green-400' },
          { label: 'Credits Transacted', value: 389, color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
