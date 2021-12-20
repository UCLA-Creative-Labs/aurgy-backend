import { Router, Request, Response } from 'express';
import { getClient } from '../../lib';
import { spooky_router } from './:id';

export const lobby_router = Router();

// Returns the lobbies a user is managing and participating in
lobby_router.get('/', async (req: Request, res: Response) => {
  const client = await getClient();
  const lobbies = await client.openCollection('lobbies');

  console.log(lobbies);
  res.status(200).json('filter');
});

// Creates a new lobby and returns the lobby id w/ lobby data
lobby_router.post('/', async (req: Request, res: Response) => {
  const client = await getClient();

  const userId = req.body.userId;
  const refreshToken = req.body.refreshToken;
  const users = [userId];

  const lobby = {
    owner: userId + refreshToken,
    users: users,
  };

  const userTable = await client.openCollection('lobbies');
  if (false) {
    await userTable.insertOne(lobby);
  }

  res.status(200).json({ message: 'Filler.' });
});

// Deletes a lobby a user owns
lobby_router.delete('/', async (req: Request, res: Response) => {
  res.status(200).json('filter');
});

lobby_router.use('/', spooky_router);