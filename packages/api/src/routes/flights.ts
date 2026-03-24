import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

interface Flight {
  id: string;
  operatorId: string;
  droneName: string;
  droneType: string;
  from: string;
  to: string;
  altitudeBand: number;
  departureTime: string;
  status: 'pending' | 'approved' | 'rejected';
  riskScore: number | null;
  createdAt: string;
}

const flights: Flight[] = [];

// GET /api/v1/flights
router.get('/', (_req: Request, res: Response) => {
  res.json(flights);
});

// POST /api/v1/flights
router.post('/', (req: Request, res: Response) => {
  const { operatorId, droneName, droneType, from, to, altitudeBand, departureTime } = req.body;

  const flight: Flight = {
    id: uuidv4(),
    operatorId: operatorId || 'op-001',
    droneName: droneName || `DRN-${Math.floor(Math.random() * 900) + 100}`,
    droneType: droneType || 'Delivery',
    from: from || 'Central',
    to: to || 'Wan Chai',
    altitudeBand: altitudeBand ?? 1,
    departureTime: departureTime || new Date().toISOString(),
    status: 'pending',
    riskScore: null,
    createdAt: new Date().toISOString(),
  };

  flights.push(flight);
  res.status(201).json(flight);

  // Background deconfliction simulation
  setTimeout(() => {
    const idx = flights.findIndex(f => f.id === flight.id);
    if (idx !== -1) {
      const riskScore = Math.floor(Math.random() * 100);
      flights[idx].riskScore = riskScore;
      flights[idx].status = Math.random() < 0.8 ? 'approved' : 'rejected';
    }
  }, 4000);
});

// GET /api/v1/flights/:id
router.get('/:id', (req: Request, res: Response) => {
  const flight = flights.find(f => f.id === req.params.id);
  if (!flight) return res.status(404).json({ error: 'Flight not found' });
  res.json(flight);
});

// PATCH /api/v1/flights/:id/status
router.patch('/:id/status', (req: Request, res: Response) => {
  const idx = flights.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Flight not found' });
  flights[idx].status = req.body.status;
  res.json(flights[idx]);
});

export default router;
