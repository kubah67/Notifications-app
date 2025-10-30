import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database (replace with real DB later)
const users = [];
const events = [];
const rsvps = [];

app.use(cors());
app.use(express.json());

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    req.user = jwt.verify(token, 'secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.post('/signup', async (req, res) => {
  const { email, password, role = 'ATTENDEE' } = req.body;
  const existing = users.find(u => u.email === email);
  if (existing) return res.status(400).json({ error: 'User exists' });
  
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), email, password: hashed, role };
  users.push(user);
  
  const token = jwt.sign({ userId: user.id, email, role }, 'secret');
  res.json({ user: { id: user.id, email, role }, token });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, 'secret');
  res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
});

app.get('/events', auth, (req, res) => {
  res.json(events.filter(e => e.approved || e.organizerId === req.user.userId));
});

app.post('/events', auth, (req, res) => {
  const { title, description, date, location } = req.body;
  const event = {
    id: Date.now().toString(),
    title,
    description,
    date,
    location,
    organizerId: req.user.userId,
    approved: req.user.role === 'ADMIN'
  };
  events.push(event);
  
  // Broadcast to WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'EVENT_CREATED', event }));
    }
  });
  
  res.json(event);
});

// WebSocket Server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to events server' }));
});

console.log(`🚀 Server: http://localhost:${PORT}`);
console.log(`📡 WebSocket: ws://localhost:${PORT}`);￼Enter
