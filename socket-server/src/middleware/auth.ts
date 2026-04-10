import axios from 'axios';
import { Socket } from 'socket.io';

const LARAVEL_URL = process.env.LARAVEL_URL || 'http://localhost:8000';

export async function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication token required'));
  }

  try {
    const response = await axios.get(`${LARAVEL_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    (socket as any).user = response.data.data;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
}
