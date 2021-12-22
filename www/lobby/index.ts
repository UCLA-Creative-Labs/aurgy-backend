import { Router, Request, Response } from 'express';
import { getClient } from '../../lib';
import { spooky_router } from './:id';

export const lobby_router = Router();

// Creates a new lobby and returns the lobby id w/ lobby data
/**
 * Body Params: lobbyName, theme, id, refreshToken
 */
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
  if (userTable) {
    await userTable.insertOne(lobby);
  }

  res.status(200).json({ message: 'Filler.' });
});

// Returns the lobbies a user is managing and participating in
/**
 * Body Params: id, refreshToken
 */
lobby_router.get('/', async (req: Request, res: Response) => {
  const client = await getClient();
  const lobbies = await client.openCollection('lobbies');
  await lobbies.find();
  res.status(200).json('filter');
});

lobby_router.use('/', spooky_router);
