import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { authenticateSocket } from './middleware/auth';
import { registerChatHandlers } from './handlers/chat';
import { registerNotificationHandlers } from './handlers/notifications';
import { ChatMessagePayload, NotificationPayload } from './types/events';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const INTERNAL_SECRET = process.env.SOCKET_SECRET || 'jassi-socket-secret-2025';

// Socket.io auth middleware
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`User connected: ${(socket as any).user?.id}`);
  registerChatHandlers(io, socket);
  registerNotificationHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${(socket as any).user?.id}`);
  });
});

// Internal API for Laravel to emit events
app.post('/emit/chat', (req, res) => {
  const secret = req.headers['x-socket-secret'];
  if (secret !== INTERNAL_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const payload: ChatMessagePayload = req.body;
  io.to(`request:${payload.service_request_id}`).emit('chat:message', payload);
  res.json({ success: true });
});

app.post('/emit/notification', (req, res) => {
  const secret = req.headers['x-socket-secret'];
  if (secret !== INTERNAL_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { userId, notification }: { userId: number; notification: NotificationPayload } = req.body;
  io.to(`user:${userId}`).emit('notification:new', notification);
  res.json({ success: true });
});

app.post('/emit/queue', (req, res) => {
  const secret = req.headers['x-socket-secret'];
  if (secret !== INTERNAL_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { event, data } = req.body;
  io.emit(event, data);
  res.json({ success: true });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', connections: io.engine.clientsCount });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
