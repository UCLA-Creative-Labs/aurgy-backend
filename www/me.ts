import {Request, Response, Router} from 'express';
import { getAccessToken } from '../lib/spotify/access-token';
import { getMeInfo } from '../lib/spotify/me';
import { User } from '../lib/user';

export const me_router = Router();

me_router.post('/', async (req: Request, res: Response): Promise<void> => {
  const refreshToken: string = req.body.refreshToken;
  const accessToken = await getAccessToken(refreshToken);
  const userInfo = await getMeInfo(accessToken);

  const user = (await User.fromId(userInfo.id)) ?? new User(userInfo.id, {
    refreshToken,
    name: userInfo.display_name,
    country: userInfo.country,
    images: userInfo.images.map(img => img.url),
    uri: userInfo.uri,
    accountType: userInfo.product,
  });

  if (!user.existsInDb) {
    void user.writeToDatabase();
  }

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
