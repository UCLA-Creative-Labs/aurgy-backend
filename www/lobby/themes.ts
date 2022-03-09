import { Router, Request, Response } from 'express';
import { theme2Conditions } from '../../lib/playlist-generation/themes';
export const lobby_themes_router = Router();

lobby_themes_router.get('/themes', async (req: Request, res: Response) => {
  res.status(200).json(Object.keys(theme2Conditions));
});
