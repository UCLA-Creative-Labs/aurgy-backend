import {Request, Response} from 'express';
import { getClient } from '../lib';
import { getAccessToken } from '../lib/spotify/access-token';
import { getMeInfo } from '../lib/spotify/me';

export async function POST_login(req: Request, res: Response) {
  const client = await getClient();

  const refreshToken = req.body.refreshToken;
  const accessToken = await getAccessToken(refreshToken);
  const userInfo = await getMeInfo(accessToken);

  const userTable = await client.openCollection('users');
  userTable.insertOne(userInfo);

  res.send({accessToken});
}
