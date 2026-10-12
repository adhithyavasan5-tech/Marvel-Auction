import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { heroService } from './services/heroService.js';
import { AuctionEngine } from './services/auctionEngine.js';
import { setupAuctionSocket } from './socket/auctionSocket.js';
import { authService } from './services/authService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 20000,
  pingInterval: 10000
});

const engine = new AuctionEngine(io);

// Initialize superhero catalogue
await heroService.initialize();

// Setup WebSocket events
setupAuctionSocket(io, engine);

// REST API Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    dynasty: 'MARVEL: Omniverse Auctions',
    time: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    catalogueSource: heroService.getCatalogueSource(),
    activeRooms: engine.getAllRooms().length,
    timestamp: Date.now()
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, avatar } = req.body;
    if (!username || !password || !avatar) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await authService.register(username, password, avatar);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await authService.login(username, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/auth/check-username', (req, res) => {
  try {
    const username = (req.query.username as string || '').trim();
    const current = (req.query.current as string || '').trim();
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const isTaken = authService.isUsernameTaken(username, current);
    res.json({ available: !isTaken });
    
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/profile', (req, res) => {
  try {
    const { currentUsername, username, name, avatar } = req.body;
    if (!username || !name) {
      return res.status(400).json({ error: 'Username and display name are required' });
    }
    const updated = authService.updateProfile(currentUsername || username, username, name, avatar);
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/heroes', (req, res) => {
  try {
    const publisher = req.query.publisher as string | undefined;
    const mode = (req.query.mode as 'marvel' | 'all') || 'marvel';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const heroes = heroService.getHeroes({ publisher, mode, limit });
    res.json({
      source: heroService.getCatalogueSource(),
      count: heroes.length,
      heroes
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/:roomCode', (req, res) => {
  const room = engine.getRoom(req.params.roomCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ room });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🏰 MARVEL: Omniverse Auctions — Auction House Online`);
  console.log(`📡 Server listening on http://localhost:${PORT}`);
  console.log(`💎 Catalogue Status: [${heroService.getCatalogueSource().toUpperCase()}]`);
  console.log(`======================================================\n`);
});
