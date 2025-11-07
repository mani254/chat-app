import { Server, Socket } from 'socket.io';

const registerChatHandlers = (socket: Socket, io: Server) => {
  try {
    socket.on('join-chat', (chatId: string) => {
      console.log('joined chat room');
      socket.join(chatId);
    });
    socket.on('leave-chat', (chatId: string) => {
      console.log(`User ${socket.id} left chat room: ${chatId}`);
      socket.leave(chatId);
    });
  } catch (err: any) {
    console.error('chatError:', err);
    socket.emit('error', 'Message sending failed');
  }
};

export default registerChatHandlers;
