import { Router, Request, Response } from 'express';
import { Lobby } from '../../lib/lobby';
import { User } from '../../lib/user';
import { lobby_id_router } from './:id';

export const lobby_router = Router();

let retryNum = 0;
// const HASH_16 = 1000000000100011;

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
  const lobbyId = generateLobbyId(userId).toString();
  const manager = await User.fromId(userId) ?? null;
  if (!manager) {
    res.status(404).json('user dne');
    return;
  }
  const lobby = (await Lobby.fromId(lobbyId)) ?? new Lobby(lobbyId,  {
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

const generateLobbyId = (userId : string) : string => {
  const lobbyId : string = userId + Date.now() + retryNum;
  retryNum++;
  return lobbyId;
};
