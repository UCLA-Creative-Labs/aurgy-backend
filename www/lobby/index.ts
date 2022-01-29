import { Router, Request, Response } from 'express';
import { Lobby } from '../../lib/lobby';
import { User } from '../../lib/user';
import { validateJwt } from '../../utils/jwt';
import { lobby_id_router } from './id';

export const lobby_router = Router();

lobby_router.use('/middleware', validateJwt);

// Creates a new lobby and returns the lobby id w/ lobby data
/**
 * Body Params: lobbyName, theme, id, refreshToken
 */
lobby_router.post('/', async (req: Request, res: Response) => {
  const lobbyName = req.body.lobbyName;
  const theme = req.body.theme;
  const userId = req.body.id;

  const manager = await User.fromId(userId);
  if (!manager) return res.status(404).json('user not found in database').end();

  const lobby = await Lobby.create({
    theme: theme,
    name: lobbyName,
    managerId: userId,
  });

  if(!lobby) return res.status(500).json('unable to create lobby at this time').end();

  void lobby.writeToDatabase();

  res.status(200).json({ name: lobby.name, id: lobby.id });
});

// Returns the lobbies a user is managing and participating in
/**
 * Body Params: id, refreshToken
 */
lobby_router.get('/', async (req: Request, res: Response) => {
  res.status(200).json('placeholder get');
});

lobby_router.use('/', lobby_id_router);