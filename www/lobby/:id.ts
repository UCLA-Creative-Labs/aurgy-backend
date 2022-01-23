import { Router, Request, Response } from 'express';

export const lobby_id_router = Router();

// Join a lobby
/**
 * Body Params: id, lobbyToken, refreshToken
 */
lobby_id_router.post('/:id', async (req: Request, res: Response) => {
  res.status(200).json('placeholder post');
});

// Get lobby specific info
/**
 * Body Params: id, refreshToken
 */
lobby_id_router.get('/:id', async (req: Request, res: Response) => {
  res.status(200).json('placeholder get');
});

// Update lobby information
/**
 * Body Params: id, name, refreshToken
 */
lobby_id_router.patch('/:id', async (req: Request, res: Response) => {
  res.status(200).json('placeholder patch');
});

// Delete a lobby
/**
 * Body Params: id, refreshToken
 */
lobby_id_router.delete('/:id', async (req: Request, res: Response) => {
  res.status(200).json('placeholder delete');
});
