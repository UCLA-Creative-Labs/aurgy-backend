import { Router, Request, Response } from 'express';
import { getClient } from '../../lib';
import { Lobby } from '../../lib/lobby';
import { COLLECTION } from '../../lib/private/enums';
import { User } from '../../lib/user';
import { generateLobbyId } from '../../utils/lobby';
import { lobby_id_router } from './:id';

export const lobby_router = Router();

// verification middleware
lobby_router.use('/midtest', async (req: Request, res: Response, next: any) => {
  const userId = req.body.id;
  const refreshToken = req.body.refreshToken;

  const user = (await User.fromId(userId) ?? null);
  if (!user) {
    res.status(404).json('user DNE');
    return;
  }

  const verify = await User.verifyRequest(userId, refreshToken);
  if (verify.status !== 200) {
    res.status(403).json('verify fail');
    return;
  }
  next();
});

// Creates a new lobby and returns the lobby id w/ lobby data
/**
 * Body Params: lobbyName, theme, id, refreshToken
 */
lobby_router.post('/', async (req: Request, res: Response) => {
  const lobbyName = req.body.lobbyName;
  const theme = req.body.theme;
  const userId = req.body.id;
  const participants = [userId];

  const manager = await User.fromId(userId) ?? null;
  if (!manager) {
    res.status(404).json('user dne');
    return;
  }

  const client = await getClient();
  let retryNum = 0;
  let lobbyId = generateLobbyId(userId, retryNum).toString();
  let exists = await client.findDbItem(COLLECTION.LOBBIES, lobbyId);
  while (exists) {
    lobbyId = generateLobbyId(userId, retryNum).toString();
    exists = await client.findDbItem(COLLECTION.LOBBIES, lobbyId);
    retryNum++;
  }

  const lobby = new Lobby(lobbyId, {
    theme: theme,
    name: lobbyName,
    manager: manager,
    participants: participants,
    spotifyPlaylistId: undefined,
  });

  void lobby.writeToDatabase();

  res.status(200).json({ name: lobbyName, id: lobbyId });
});

// Returns the lobbies a user is managing and participating in
/**
 * Body Params: id, refreshToken
 */
lobby_router.get('/', async (req: Request, res: Response) => {
  res.status(200).json('placeholder get');
});

lobby_router.use('/', lobby_id_router);
