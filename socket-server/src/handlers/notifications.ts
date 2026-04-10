import { Socket, Server } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from '../types/events';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerNotificationHandlers(io: TypedServer, socket: TypedSocket) {
  const user = (socket as any).user;
  socket.join(`user:${user.id}`);
  console.log(`User ${user.id} joined notification room`);
}
