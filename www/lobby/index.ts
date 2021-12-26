import { Router, Request, Response } from 'express';
import { Lobby } from '../../lib/lobby';
import { User } from '../../lib/user';
import { validateJwt } from '../../utils/jwt';
import { generateLobbyId } from '../../utils/lobby';
import { lobby_id_router } from './:id';

export const lobby_router = Router();

lobby_router.use('/midtest', validateJwt);

// Creates a new lobby and returns the lobby id w/ lobby data
/**
 * Body Params: lobbyName, theme, id, refreshToken
 */
lobby_router.post('/', async (req: Request, res: Response) => {
  const lobbyName = req.body.lobbyName;
  const theme = req.body.theme;
  const userId = req.body.id;
  const participants = [userId];
  const songIds : string[] = [];

  const manager = await User.fromId(userId) ?? null;
  if (!manager) {
    res.status(404).json('user dne');
    return;
  }

  let retryNum = 0;
  let lobbyId = generateLobbyId(userId, retryNum);
  let exists = await Lobby.fromId(lobbyId);
  while (exists) {
    retryNum++;
    lobbyId = generateLobbyId(userId, retryNum);
    exists = await Lobby.fromId(lobbyId);
  }

  const lobby = new Lobby(lobbyId, {
    theme: theme,
    name: lobbyName,
    managerId: userId,
    participants: participants,
    spotifyPlaylistId: undefined,
    songIds: songIds,
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
