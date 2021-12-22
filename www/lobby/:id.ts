import { Router, Request, Response } from 'express';
// import { getClient } from '../../lib';

export const spooky_router = Router();

// Join a lobby
/**
 * Body Params: id, lobbyToken, refreshToken
 */
spooky_router.post('/:id', async (req: Request, res: Response) => {
  const userId = req.body.userId;

  const lobby = {
    owner: 12345,
    users: [],
  };
  const users = [...lobby.users];
  users.concat(userId);

  lobby.users = users;

  // update lobby in database

  res.status(200).json('spooky post');
});

// Get lobby specific info
/**
 * Body Params: id, refreshToken
 */
spooky_router.get('/:id', async (req: Request, res: Response) => {
  res.status(200).json('spooky get');
});

// Update lobby information
/**
 * Body Params: id, name, refreshToken
 */
spooky_router.patch('/:id', async (req: Request, res: Response) => {
  res.status(200).json('spooky get');
});

// Delete a lobby
/**
 * Body Params: id, refreshToken
 */
spooky_router.delete('/:id', async (req: Request, res: Response) => {
  const userId = req.body.userId;

  const lobby = {
    owner: 12345,
    users: [],
  };

  // remove user from lobby
  const users = [...lobby.users].filter(user => user !== userId);
  lobby.users = users;

  // update lobby in database

  res.status(200).json('spooky delete');
});
