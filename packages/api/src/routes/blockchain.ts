import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

type EventType =
  | 'FLIGHT_APPROVED'
  | 'CREDIT_TRANSACTION'
  | 'SAFETY_EVENT'
  | 'PRIVACY_COMPLIANCE'
  | 'TELEMETRY_ANCHOR';

interface BlockchainEvent {
  id: string;
  type: EventType;
  payload: Record<string, unknown>;
  txHash: string;
  blockHeight: number;
  timestamp: string;
}

function randomHex(len = 64): string {
  const chars = '0123456789abcdef';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * 16)]).join('');
}

let blockHeight = 837;

const events: BlockchainEvent[] = [
  {
    id: uuidv4(),
    type: 'FLIGHT_APPROVED',
    payload: { flightId: 'flt-001', operator: 'Alice', band: 1 },
    txHash: randomHex(),
    blockHeight: 837,
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'CREDIT_TRANSACTION',
    payload: { from: 'Alice', to: 'pool', amount: 8, reason: 'VCG bid' },
    txHash: randomHex(),
    blockHeight: 838,
    timestamp: new Date(Date.now() - 270000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'SAFETY_EVENT',
    payload: { drone: 'DRN-042', type: 'separation_violation', distance: 94 },
    txHash: randomHex(),
    blockHeight: 839,
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'PRIVACY_COMPLIANCE',
    payload: { zone: 'Residential Tower B', action: 'camera_disabled', drone: 'DRN-017' },
    txHash: randomHex(),
    blockHeight: 840,
    timestamp: new Date(Date.now() - 200000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'TELEMETRY_ANCHOR',
    payload: { droneCount: 12, batchHash: randomHex(32) },
    txHash: randomHex(),
    blockHeight: 841,
    timestamp: new Date(Date.now() - 160000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'FLIGHT_APPROVED',
    payload: { flightId: 'flt-002', operator: 'Bob', band: 2 },
    txHash: randomHex(),
    blockHeight: 842,
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'CREDIT_TRANSACTION',
    payload: { from: 'Bob', to: 'pool', amount: 5, reason: 'VCG bid' },
    txHash: randomHex(),
    blockHeight: 843,
    timestamp: new Date(Date.now() - 90000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'SAFETY_EVENT',
    payload: { drone: 'DRN-009', type: 'no_go_zone_breach', zone: 'HKIA perimeter' },
    txHash: randomHex(),
    blockHeight: 844,
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'TELEMETRY_ANCHOR',
    payload: { droneCount: 18, batchHash: randomHex(32) },
    txHash: randomHex(),
    blockHeight: 845,
    timestamp: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'FLIGHT_APPROVED',
    payload: { flightId: 'flt-003', operator: 'Carol', band: 0 },
    txHash: randomHex(),
    blockHeight: 846,
    timestamp: new Date(Date.now() - 10000).toISOString(),
  },
];

blockHeight = 847;

// GET /api/v1/blockchain/stats
router.get('/stats', (_req: Request, res: Response) => {
  res.json({
    tpsEstimate: 1.5,
    blockHeight,
    totalEvents: events.length,
    lastBlockTime: events[events.length - 1]?.timestamp || new Date().toISOString(),
  });
});

// GET /api/v1/blockchain/events
router.get('/events', (_req: Request, res: Response) => {
  const last50 = events.slice(-50).reverse();
  res.json(last50);
});

// POST /api/v1/blockchain/events
router.post('/events', (req: Request, res: Response) => {
  blockHeight += 1;
  const event: BlockchainEvent = {
    id: uuidv4(),
    type: req.body.type || 'SAFETY_EVENT',
    payload: req.body.payload || {},
    txHash: randomHex(),
    blockHeight,
    timestamp: new Date().toISOString(),
  };
  events.push(event);
  res.status(201).json(event);
});

export default router;
