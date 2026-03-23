import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

interface Drone {
  id: string;
  lat: number;
  lng: number;
  altitude: number;
  heading: number;
  speed: number;
  battery: number;
  status: 'active' | 'rogue' | 'warning' | 'landed';
  band: number;
  operatorId: string;
  createdAt: string;
}

const activeDrones: Map<string, Drone> = new Map();

function randomHKPosition() {
  return {
    lat: 22.28 + Math.random() * 0.07,
    lng: 114.15 + Math.random() * 0.07,
    altitude: Math.floor(Math.random() * 320) + 40,
    heading: Math.floor(Math.random() * 360),
    speed: Math.floor(Math.random() * 50) + 10,
    battery: Math.floor(Math.random() * 40) + 55,
  };
}

// POST /api/v1/simulator/launch
router.post('/launch', (req: Request, res: Response) => {
  const count = Math.min(parseInt(req.body.count) || 10, 50);
  const launched: Drone[] = [];

  for (let i = 0; i < count; i++) {
    const id = `DRN-${String(activeDrones.size + i + 1).padStart(3, '0')}`;
    const drone: Drone = {
      id,
      ...randomHKPosition(),
      status: 'active',
      band: Math.floor(Math.random() * 5),
      operatorId: `op-${String(Math.floor(Math.random() * 5) + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    activeDrones.set(id, drone);
    launched.push(drone);
  }

  res.status(201).json(launched);
});

// POST /api/v1/simulator/rogue
router.post('/rogue', (_req: Request, res: Response) => {
  const chars = '0123456789abcdef';
  const txHash = Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * 16)]).join('');

  const rogueId = `ROGUE-${uuidv4().slice(0, 8).toUpperCase()}`;
  const rogue: Drone = {
    id: rogueId,
    lat: 22.305 + Math.random() * 0.02,
    lng: 114.175 + Math.random() * 0.02,
    altitude: Math.floor(Math.random() * 200) + 100,
    heading: Math.floor(Math.random() * 360),
    speed: Math.floor(Math.random() * 80) + 30,
    battery: Math.floor(Math.random() * 30) + 20,
    status: 'rogue',
    band: -1,
    operatorId: 'UNKNOWN',
    createdAt: new Date().toISOString(),
  };

  activeDrones.set(rogueId, rogue);

  res.status(201).json({
    drone: rogue,
    incident: {
      id: uuidv4(),
      type: 'ROGUE_DRONE_DETECTED',
      droneId: rogueId,
      txHash,
      blockHeight: Math.floor(Math.random() * 100) + 850,
      timestamp: new Date().toISOString(),
      threat: 'CRITICAL',
      location: { lat: rogue.lat, lng: rogue.lng },
    },
  });
});

// GET /api/v1/simulator/drones
router.get('/drones', (_req: Request, res: Response) => {
  // Animate drones slightly
  activeDrones.forEach((drone) => {
    if (drone.status !== 'rogue') {
      drone.lat += (Math.random() - 0.5) * 0.001;
      drone.lng += (Math.random() - 0.5) * 0.001;
      drone.heading = (drone.heading + Math.floor(Math.random() * 10) - 5 + 360) % 360;
    } else {
      drone.lat += (Math.random() - 0.5) * 0.002;
      drone.lng += (Math.random() - 0.5) * 0.002;
    }
  });
  res.json(Array.from(activeDrones.values()));
});

// DELETE /api/v1/simulator/drones
router.delete('/drones', (_req: Request, res: Response) => {
  activeDrones.clear();
  res.json({ message: 'All drones cleared', count: 0 });
});

export default router;
