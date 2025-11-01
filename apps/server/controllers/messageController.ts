import { MessageQueryParams } from '@workspace/database';
import { Response } from 'express';
import messageServices from '../services/messageServices';
import { AuthRequest } from '../types';

export const fetchMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, senderId, messageType, search, page, limit, sortBy, orderBy, includeChat, skip } =
      req.query as unknown as MessageQueryParams;

    // Validate required params
    if (!chatId) {
      res.status(400).json({ message: 'chatId is required' });
      return;
    }

    const allowedSortFields = ['createdAt', 'updatedAt'];
    const allowedOrderValues = ['asc', 'desc'];
    const allowedTypes = ['text', 'media', 'note'];

    if (sortBy && !allowedSortFields.includes(sortBy)) {
      res.status(400).json({
        message: `Invalid sort field. Allowed: ${allowedSortFields.join(', ')}`,
      });
      return;
    }

    if (orderBy && !allowedOrderValues.includes(orderBy)) {
      res.status(400).json({
        message: `Invalid orderBy value. Allowed: ${allowedOrderValues.join(', ')}`,
      });
      return;
    }

    if (messageType && !allowedTypes.includes(messageType)) {
      res.status(400).json({
        message: `Invalid messageType. Allowed: ${allowedTypes.join(', ')}`,
      });
      return;
    }

    const data = await messageServices.fetchMessages({
      chatId,
      senderId,
      messageType,
      search,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
      sortBy,
      orderBy,
      includeChat: includeChat === 'true', // from query string it's string
    });

    res.status(200).json({
      message: 'Messages fetched successfully',
      messages: data.messages,
      totalItems: data.totalItems,
    });
  } catch (error: any) {
    console.error('Error while fetching messages:', error);
    res.status(500).json({
      message: 'Error while fetching messages',
      error: error.message,
    });
  }
};
