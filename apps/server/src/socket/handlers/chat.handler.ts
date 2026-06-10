import { Server, Socket } from 'socket.io';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export function handleChatEvents(io: Server, socket: Socket): void {
  const userId = (socket as any).userId;
  const userName = (socket as any).userName;

  socket.on('chat:message', async (data: {
    roomId: string;
    content: string;
    type?: 'TEXT' | 'EMOTE' | 'SYSTEM';
  }) => {
    if (!data.content || data.content.trim().length === 0) return;
    if (data.content.length > 500) return;

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      userName,
      content: data.content.trim(),
      type: data.type || 'TEXT',
      timestamp: Date.now(),
    };

    io.to(data.roomId).emit('chat:message', message);

    // Persist to database
    try {
      await prisma.chatMessage.create({
        data: {
          auctionRoomId: data.roomId,
          userId,
          content: message.content,
          type: message.type,
        },
      });
    } catch (error) {
      logger.error('Failed to save chat message:', error);
    }
  });

  socket.on('chat:emote', (data: { roomId: string; emote: string }) => {
    const validEmotes = ['👏', '🔥', '💰', '😱', '😤', '🎉', '💪', '🤣', '😈', '🏏'];
    if (!validEmotes.includes(data.emote)) return;

    io.to(data.roomId).emit('chat:emote', {
      userId,
      userName,
      emote: data.emote,
      timestamp: Date.now(),
    });
  });

  socket.on('chat:history', async (data: { roomId: string; limit?: number }, callback: (response: any) => void) => {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: { auctionRoomId: data.roomId },
        orderBy: { createdAt: 'desc' },
        take: data.limit || 50,
        include: { user: { select: { name: true, image: true } } },
      });

      callback({
        success: true,
        messages: messages.reverse().map(m => ({
          id: m.id,
          userId: m.userId,
          userName: m.user?.name || 'Guest',
          content: m.content,
          type: m.type,
          timestamp: m.createdAt.getTime(),
        })),
      });
    } catch (error: any) {
      callback({ success: false, error: error.message });
    }
  });
}
