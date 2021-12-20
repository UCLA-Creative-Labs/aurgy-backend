import { Router, Request, Response } from 'express';
// import { getClient } from '../../lib';

export const spooky_router = Router();

// Get lobby specific info
spooky_router.get('/:id', async (req: Request, res: Response) => {
  const lobby = {
    owner: 12345,
    users: [],
  };

  console.log(lobby);

  res.status(200).json('spooky get');
});

// Join a lobby
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

// Leave a lobby
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
