import {Request, Response} from 'express';
import { getAccessToken } from '../lib/spotify/access-token';

export async function POST_login(req: Request, res: Response) {
  const refreshToken = req.body.refreshToken;
  const accessToken = getAccessToken(refreshToken);
  res.send({accessToken});
}
