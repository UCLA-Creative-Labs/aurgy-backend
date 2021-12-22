import { Router, Request, Response } from 'express';
import { Lobby } from '../../lib/lobby';
import { User } from '../../lib/user';
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
  const refreshToken = req.body.refreshToken;

  const users = [userId];
  const lobbyId = generateLobbyId(userId, refreshToken);
  const lobby = (await Lobby.fromId(lobbyId)) ?? new Lobby(lobbyId,  {
    theme,
    name: lobbyName,
    ownerId: userId,
    users: users,
    playlistId: undefined,
  });

  if (!lobby.existsInDb) {
    console.log(`created lobby ${lobbyName}: ${lobbyId}`);
    void lobby.writeToDatabase();
  }

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

const generateLobbyId = (userId : string, refreshToken : string) : string => {
  return userId + refreshToken + Date.now();
};
