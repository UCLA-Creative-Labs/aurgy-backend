import {Request, Response, Router} from 'express';
import { UserInfoResponse } from '../lib';
import { getAccessToken } from '../lib/spotify/access-token';
import { getMeInfo } from '../lib/spotify/me';
import { User } from '../lib/user';
import { logger } from '../utils';

export const me_router = Router();

me_router.post('/', async (req: Request, res: Response): Promise<void> => {
  const refreshToken: string = req.body.refreshToken;

  const getUserInfo = async (): Promise<UserInfoResponse | null> => {
    try {
      const accessToken = await getAccessToken(refreshToken);
      return getMeInfo(accessToken);
    } catch (err) {
      logger.error(err);
    }
    return null;
  }

  const userInfo = await getUserInfo();

  if (userInfo === null) {
    res.status(403).end();
    return;
  }

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
  user.updateRefreshToken(refreshToken);

  res.status(200).send(user.getClientResponse());
});

me_router.get('/', async (req: Request, res: Response): Promise<void> => {
  const refreshToken: string = req.body.refreshToken;
  const id: string = req.body.id;

  const {status, user} = await User.verifyRequest(id, refreshToken);
  if (status === 200 && user)
    res.status(status).send(user.getClientResponse());
  else
    res.status(status).end();
});

me_router.delete('/', async (req: Request, res: Response): Promise<void> => {
  const refreshToken: string = req.body.refreshToken;
  const id: string = req.body.id;

  const {status, user} = await User.verifyRequest(id, refreshToken);
  if (status === 200 && user)
    void user.removeFromDatabase();
  res.status(status).end();
});
