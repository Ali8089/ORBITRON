import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

interface Auction {
  id: string;
  flightId: string;
  operatorId: string;
  bidAmount: number;
  payAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const auctions: Auction[] = [];

// GET /api/v1/auctions
router.get('/', (_req: Request, res: Response) => {
  res.json(auctions);
});

// POST /api/v1/auctions
router.post('/', (req: Request, res: Response) => {
  const { flightId, operatorId, bidAmount } = req.body;

  const bid = parseFloat(bidAmount) || 12;
  // VCG pricing: pay = harm caused = bid * 0.67
  const payAmount = Math.round(bid * 0.67);

  const auction: Auction = {
    id: uuidv4(),
    flightId: flightId || uuidv4(),
    operatorId: operatorId || 'op-001',
    bidAmount: bid,
    payAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  auctions.push(auction);
  res.status(201).json(auction);

  // Resolve auction after 2s
  setTimeout(() => {
    const idx = auctions.findIndex(a => a.id === auction.id);
    if (idx !== -1) {
      auctions[idx].status = Math.random() < 0.85 ? 'approved' : 'rejected';
    }
  }, 2000);
});

// GET /api/v1/auctions/:id
router.get('/:id', (req: Request, res: Response) => {
  const auction = auctions.find(a => a.id === req.params.id);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  res.json(auction);
});

export default router;
