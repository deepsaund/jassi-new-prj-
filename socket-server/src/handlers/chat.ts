import { Socket, Server } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from '../types/events';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerChatHandlers(io: TypedServer, socket: TypedSocket) {
  const user = (socket as any).user;

  socket.on('join:request', (requestId: number) => {
    socket.join(`request:${requestId}`);
    console.log(`User ${user.id} joined request:${requestId}`);
  });

  socket.on('leave:request', (requestId: number) => {
    socket.leave(`request:${requestId}`);
    console.log(`User ${user.id} left request:${requestId}`);
  });

  socket.on('chat:typing', (data) => {
    socket.to(`request:${data.requestId}`).emit('chat:message', {
      id: 0,
      service_request_id: data.requestId,
      sender_id: user.id,
      sender_name: user.name,
      message: '',
      attachment_path: null,
      created_at: new Date().toISOString(),
    });
  });
}
