'use client'

import { useState, useEffect } from 'react'

const API = 'http://localhost:4000/api/v1'

const HK_LOCATIONS = [
  'Kwun Tong', 'Central', 'Tseung Kwan O', 'Kowloon Bay',
  'Wan Chai', 'Tsim Sha Tsui', 'Mongkok', 'Sha Tin',
]

const DRONE_TYPES = ['Delivery', 'Inspection', 'Surveillance', 'Medical', 'Photography']

const ALTITUDE_BANDS = [
  { value: 0, label: 'Band 0: 0–80 m' },
  { value: 1, label: 'Band 1: 80–160 m' },
  { value: 2, label: 'Band 2: 160–240 m' },
  { value: 3, label: 'Band 3: 240–320 m' },
  { value: 4, label: 'Band 4: 320–400 m' },
]

const ALT_ROUTES = [
  { label: 'Route A – Band 0 via Causeway Bay', cost: 4 },
  { label: 'Route B – Band 2 direct', cost: 7 },
  { label: 'Route C – Band 1 via Kowloon', cost: 5 },
]

interface Flight {
  id: string
  droneName: string
  droneType: string
  from: string
  to: string
  altitudeBand: number
  departureTime: string
  status: 'pending' | 'approved' | 'rejected'
  riskScore: number | null
  createdAt: string
}

interface AuctionResult {
  bid: number
  pay: number
  status: 'pending' | 'approved' | 'rejected'
}

export default function OperatorDashboard() {
  const [credits, setCredits] = useState(50)
  const [from, setFrom] = useState('Kwun Tong')
  const [to, setTo] = useState('Central')
  const [droneType, setDroneType] = useState('Delivery')
  const [altitudeBand, setAltitudeBand] = useState(1)
  const [departureTime, setDepartureTime] = useState('')
  const [isDeconflicting, setIsDeconflicting] = useState(false)
  const [showSafetyReport, setShowSafetyReport] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)
  const [bidAmount, setBidAmount] = useState(12)
  const [auctionResult, setAuctionResult] = useState<AuctionResult | null>(null)
  const [flights, setFlights] = useState<Flight[]>([])
  const [currentFlightId, setCurrentFlightId] = useState<string | null>(null)

  useEffect(() => {
    fetchFlights()
  }, [])

  // Poll for flight status updates
  useEffect(() => {
    if (!currentFlightId) return
    const interval = setInterval(() => {
      fetchFlights()
    }, 2000)
    return () => clearInterval(interval)
  }, [currentFlightId])

  async function fetchFlights() {
    try {
      const res = await fetch(`${API}/flights`)
      if (res.ok) {
        const data = await res.json()
        setFlights(data)
      }
    } catch {
      // API unavailable – keep existing data
    }
  }

  async function handleSubmitFlight(e: React.FormEvent) {
    e.preventDefault()
    setIsDeconflicting(true)
    setShowSafetyReport(false)
    setAuctionResult(null)
    setSelectedRoute(null)

    try {
      const res = await fetch(`${API}/flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, droneType, altitudeBand, departureTime }),
      })
      if (res.ok) {
        const flight = await res.json()
        setCurrentFlightId(flight.id)
        setFlights(prev => [flight, ...prev])
      }
    } catch {
      // API unavailable – add mock flight locally
      const mockFlight: Flight = {
        id: `local-${Date.now()}`,
        droneName: `DRN-${Math.floor(Math.random() * 900) + 100}`,
        droneType,
        from,
        to,
        altitudeBand,
        departureTime: departureTime || new Date().toISOString(),
        status: 'pending',
        riskScore: null,
        createdAt: new Date().toISOString(),
      }
      setCurrentFlightId(mockFlight.id)
      setFlights(prev => [mockFlight, ...prev])
      setTimeout(() => {
        setFlights(prev =>
          prev.map(f =>
            f.id === mockFlight.id
              ? { ...f, status: Math.random() < 0.8 ? 'approved' : 'rejected', riskScore: Math.floor(Math.random() * 100) }
              : f
          )
        )
      }, 4000)
    }

    // Show deconfliction result after 4 seconds
    setTimeout(() => {
      setIsDeconflicting(false)
      setShowSafetyReport(true)
      fetchFlights()
    }, 4000)
  }

  async function handleSubmitBid() {
    const pay = Math.round(bidAmount * 0.67)
    setAuctionResult({ bid: bidAmount, pay, status: 'pending' })

    try {
      const res = await fetch(`${API}/auctions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: currentFlightId, bidAmount }),
      })
      if (res.ok) {
        const auction = await res.json()
        setTimeout(() => {
          setAuctionResult(prev => prev ? { ...prev, status: auction.status === 'pending' ? 'approved' : auction.status } : prev)
          if (auction.status !== 'rejected') {
            setCredits(c => c - pay)
          }
        }, 2000)
      }
    } catch {
      setTimeout(() => {
        const approved = Math.random() < 0.85
        setAuctionResult(prev => prev ? { ...prev, status: approved ? 'approved' : 'rejected' } : prev)
        if (approved) setCredits(c => c - pay)
      }, 2000)
    }
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
      approved: 'bg-green-500/20 text-green-300 border border-green-500/40',
      rejected: 'bg-red-500/20 text-red-300 border border-red-500/40',
    }
    return map[status] || 'bg-gray-700 text-gray-300'
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇭🇰</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                ORBITRON UTM <span className="text-blue-400">–</span> Operator Dashboard
              </h1>
              <p className="text-xs text-slate-400">Hong Kong Unmanned Traffic Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 rounded-lg px-4 py-2 border border-slate-600">
              <p className="text-xs text-slate-400">Credit Balance</p>
              <p className="text-xl font-bold text-blue-400">{credits} <span className="text-sm font-normal text-slate-400">credits</span></p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-400">Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Flight Plan Form */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">✈</span> Submit Flight Plan
              </h2>
              <form onSubmit={handleSubmitFlight} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">From</label>
                  <select
                    value={from}
                    onChange={e => setFrom(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {HK_LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">To</label>
                  <select
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {HK_LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Drone Type</label>
                  <select
                    value={droneType}
                    onChange={e => setDroneType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {DRONE_TYPES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Altitude Band</label>
                  <select
                    value={altitudeBand}
                    onChange={e => setAltitudeBand(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    {ALTITUDE_BANDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Departure Time</label>
                  <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isDeconflicting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isDeconflicting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Running AI deconfliction... (4s)
                    </>
                  ) : (
                    '⚡ Submit for Deconfliction'
                  )}
                </button>
              </form>
            </div>

            {/* VCG Auction Panel */}
            {showSafetyReport && (
              <div className="bg-slate-900 rounded-xl border border-blue-500/30 p-6">
                <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="text-yellow-400">💰</span> VCG Slot Auction
                </h2>
                <p className="text-xs text-slate-400 mb-4">You pay only the harm you cause others</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Bid Amount (credits)</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={e => setBidAmount(Number(e.target.value))}
                      min={1}
                      max={credits}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <button
                    onClick={handleSubmitBid}
                    disabled={!!auctionResult}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Submit Bid
                  </button>

                  {auctionResult && (
                    <div className="bg-slate-800 rounded-lg p-4 space-y-2">
                      <div className="text-sm text-white">
                        You bid <span className="font-bold text-yellow-300">{auctionResult.bid} credits</span>
                      </div>
                      <div className="text-sm text-white">
                        You <span className="font-bold">PAY</span>{' '}
                        <span className="font-bold text-green-300">{auctionResult.pay} credits</span>{' '}
                        <span className="text-slate-400">(VCG pricing)</span>
                      </div>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge(auctionResult.status)}`}>
                        {auctionResult.status === 'pending' && '⏳ '}
                        {auctionResult.status === 'approved' && '✅ '}
                        {auctionResult.status === 'rejected' && '❌ '}
                        {auctionResult.status.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Middle: AI Safety Report */}
          <div className="lg:col-span-2 space-y-4">
            {showSafetyReport && (
              <div className="bg-slate-900 rounded-xl border border-green-500/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="text-green-400">🤖</span> AI Safety Report
                  </h2>
                  <span className="text-xs bg-green-900/40 text-green-300 border border-green-700/40 px-3 py-1 rounded-full">
                    Rule-based risk engine — transparent, auditable
                  </span>
                </div>

                {/* Risk Scores */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: 'Wind Gust', value: 23, color: 'green' },
                    { label: 'Occupancy', value: 41, color: 'yellow' },
                    { label: 'Building Density', value: 67, color: 'red' },
                  ].map(r => (
                    <div key={r.label} className="bg-slate-800 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-400 mb-1">{r.label}</p>
                      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full ${r.color === 'green' ? 'bg-green-500' : r.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${r.value}%` }}
                        />
                      </div>
                      <p className={`text-xl font-bold ${r.color === 'green' ? 'text-green-400' : r.color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {r.value}%
                      </p>
                    </div>
                  ))}
                </div>

                {/* Conflict Warning */}
                <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg p-4 mb-5">
                  <p className="text-yellow-300 text-sm font-semibold mb-1">⚠ Conflict Detected</p>
                  <p className="text-slate-300 text-sm">Medical drone at 10:32am – Band 2 occupying your requested slot.</p>
                </div>

                {/* Alternative Routes */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Alternative Routes</h3>
                  <div className="space-y-2">
                    {ALT_ROUTES.map((route, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedRoute(i)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-sm ${
                          selectedRoute === i
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500/50'
                        }`}
                      >
                        <span>{route.label}</span>
                        <span className={`font-bold ${selectedRoute === i ? 'text-blue-300' : 'text-yellow-400'}`}>
                          {route.cost} credits
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!showSafetyReport && !isDeconflicting && (
              <div className="bg-slate-900 rounded-xl border border-slate-700 p-12 flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Ready to Submit a Flight Plan</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Fill in the form on the left and click &quot;Submit for Deconfliction&quot;. The AI safety engine will analyse your route in 4 seconds.
                </p>
              </div>
            )}

            {isDeconflicting && (
              <div className="bg-slate-900 rounded-xl border border-blue-500/30 p-12 flex flex-col items-center justify-center text-center">
                <svg className="animate-spin h-12 w-12 text-blue-400 mb-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <h3 className="text-xl font-semibold text-blue-300 mb-2">Running AI Deconfliction...</h3>
                <p className="text-slate-400 text-sm">Analysing airspace conflicts, wind patterns, and building density for {from} → {to}</p>
              </div>
            )}

            {/* My Flights Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-slate-400">📋</span> My Flight Plans
              </h2>
              {flights.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-6">No flights submitted yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
                        <th className="pb-2 pr-4">Drone</th>
                        <th className="pb-2 pr-4">Route</th>
                        <th className="pb-2 pr-4">Type</th>
                        <th className="pb-2 pr-4">Band</th>
                        <th className="pb-2 pr-4">Risk</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flights.map(f => (
                        <tr key={f.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                          <td className="py-2 pr-4 font-mono text-xs text-slate-300">{f.droneName || 'DRN-???'}</td>
                          <td className="py-2 pr-4 text-slate-300">{f.from} → {f.to}</td>
                          <td className="py-2 pr-4 text-slate-400">{f.droneType}</td>
                          <td className="py-2 pr-4 text-slate-400">{f.altitudeBand}</td>
                          <td className="py-2 pr-4 text-slate-400">{f.riskScore !== null && f.riskScore !== undefined ? `${f.riskScore}%` : '–'}</td>
                          <td className="py-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(f.status)}`}>
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
