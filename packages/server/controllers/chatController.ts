// controllers/chatController.ts
import { ChatQueryParams } from '@workspace/database';
import { Response } from 'express';
import { Types } from 'mongoose';
import chatServices from '../services/chatServices';
import { AuthRequest } from '../types';

export const fetchChats = async (req: AuthRequest, res: Response) => {
  try {
    const { sortBy, orderBy, userId } = req.query as ChatQueryParams;

    const allowedSortFields = ['createdAt', 'updatedAt', 'name'];

    if (sortBy && !allowedSortFields.includes(sortBy)) {
      res.status(400).json({
        message: 'Invalid sort field. Allowed fields: createdAt, updatedAt, name',
      });
      return;
    }

    if (orderBy && !['asc', 'desc'].includes(orderBy)) {
      res.status(400).json({ message: 'Invalid sort order. Allowed values: asc, desc.' });
      return;
    }

    if (!userId) {
      res.status(400).json({ message: 'userId is required' });
      return;
    }

    const data = await chatServices.fetchChats(req.query);

    res.status(200).json({
      message: 'Chats fetched successfully',
      chats: data.chats,
      totalItems: data.totalItems,
    });
  } catch (error: any) {
    console.error('Error while fetching chats:', error);
    res.status(500).json({ message: 'Error while fetching chats', error: error.message });
  }
};

export const getChatById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid chat ID format' });
      return;
    }

    const chat = await chatServices.getChatById(new Types.ObjectId(id));

    res.status(200).json({
      message: 'Chat fetched successfully',
      chat,
    });
  } catch (error: any) {
    console.error('Error while fetching chat by ID:', error);
    res.status(500).json({
      message: 'Error while fetching chat',
      error: error.message,
    });
  }
};

export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    const { users, isGroupChat, name, groupAdmin } = req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      res.status(400).json({ message: 'Users array is required' });
      return;
    }

    if (isGroupChat) {
      if (!name || !groupAdmin) {
        res.status(400).json({
          message: 'Group name and groupAdmin are required for group chats',
        });
        return;
      }
    } else {
      if (users.length !== 2) {
        res.status(400).json({
          message: 'One-on-one chat must contain exactly two users',
        });
        return;
      }
    }

    const chat = await chatServices.createChat(
      {
        users,
        isGroupChat,
        name,
        groupAdmin,
      },
      req.userId as Types.ObjectId,
    );

    res.status(200).json({
      message: 'Chat created successfully',
      chat,
    });
    return;
  } catch (error: any) {
    console.error('Error while creating chat:', error);
    res.status(500).json({
      message: 'Error while creating chat',
      error: error.message,
    });
  }
};
