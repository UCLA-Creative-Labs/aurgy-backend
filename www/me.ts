import {Request, Response, Router} from 'express';
import { TokenResponse, UserInfoResponse } from '../lib';
import { getAccessToken } from '../lib/spotify/access-token';
import { getMeInfo } from '../lib/spotify/me';
import { User } from '../lib/user';
import { logger } from '../utils';

export const me_router = Router();

me_router.post('/', async (req: Request, res: Response): Promise<void> => {
  const refreshToken: string = req.body.refreshToken;

  const getUserInfo = async (): Promise<{userInfo: UserInfoResponse, tokens: TokenResponse} | null> => {
    try {
      const tokens = await getAccessToken(refreshToken);
      const userInfo = await getMeInfo(tokens['access_token']);
      return {tokens, userInfo};
    } catch (err) {
      logger.error(err);
    }
    return null;
  };

  const data = await getUserInfo();

  if (data === null) {
    res.status(403).end();
    return;
  }

  const {userInfo, tokens} = data;

  const user = (await User.fromId(userInfo.id)) ?? new User(userInfo.id, {
    refreshToken,
    name: userInfo.display_name,
    country: userInfo.country,
    images: userInfo.images.map(img => img.url),
    uri: userInfo.uri,
    accountType: userInfo.product,
  });

  // This performs a write to the database so regardless of whether or not
  // this is an update, we need to write to the database
  user.updateRefreshToken(tokens['refresh_token'], false);
  user.updateTopSongs();

  res.status(200).send(user.getClientResponse());
});

me_router.get('/', async (req: Request, res: Response): Promise<void> => {
  const refreshToken: string = req.body.refreshToken;
  const id: string = req.body.id;

  const {status, user} = await User.verifyRequest(id, refreshToken);
  if (status !== 200 || !user) {
    return res.status(status).end();
  }

  user.updateTopSongs();
  res.status(status).send(user.getClientResponse());
});

me_router.delete('/', async (req: Request, res: Response): Promise<void> => {
  const refreshToken: string = req.body.refreshToken;
  const id: string = req.body.id;

  const {status, user} = await User.verifyRequest(id, refreshToken);
  if (status === 200 && user) void user.removeFromDatabase();
  res.status(status).end();
});
