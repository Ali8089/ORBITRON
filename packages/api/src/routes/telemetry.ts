import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

function randomHKPosition() {
  return {
    lat: 22.28 + Math.random() * 0.07,
    lng: 114.15 + Math.random() * 0.07,
    altitude: Math.floor(Math.random() * 400),
    heading: Math.floor(Math.random() * 360),
    speed: Math.floor(Math.random() * 60) + 10,
  };
}

// GET /api/v1/telemetry
router.get('/', (_req: Request, res: Response) => {
  const drones = Array.from({ length: 50 }, (_, i) => ({
    id: `DRN-${String(i + 1).padStart(3, '0')}`,
    ...randomHKPosition(),
    battery: Math.floor(Math.random() * 40) + 60,
    status: Math.random() < 0.9 ? 'active' : 'warning',
    timestamp: new Date().toISOString(),
  }));
  res.json(drones);
});

// POST /api/v1/telemetry
router.post('/', (req: Request, res: Response) => {
  const record = {
    id: uuidv4(),
    ...req.body,
    receivedAt: new Date().toISOString(),
  };
  res.status(201).json(record);
});

export default router;
