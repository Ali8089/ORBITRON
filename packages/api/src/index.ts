import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import flightsRouter from './routes/flights';
import auctionsRouter from './routes/auctions';
import blockchainRouter from './routes/blockchain';
import telemetryRouter from './routes/telemetry';
import simulatorRouter from './routes/simulator';

const app = express();
const PORT = process.env.API_PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/flights', flightsRouter);
app.use('/api/v1/auctions', auctionsRouter);
app.use('/api/v1/blockchain', blockchainRouter);
app.use('/api/v1/telemetry', telemetryRouter);
app.use('/api/v1/simulator', simulatorRouter);

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 ORBITRON API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/v1/health`);
});

export default app;
