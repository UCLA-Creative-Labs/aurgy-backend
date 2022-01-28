import { Router, Request, Response, NextFunction } from 'express';
// import { nextTick } from 'process';
import { User } from '../../lib';
import { Lobby } from '../../lib/lobby';
import { validateJwt, validateLobbyJwt } from '../../utils/jwt';

export const lobby_id_router = Router();

const joinLobby = async (req: Request, res: Response) => {
  // check if token is valid
  const lobbyId: string = req.body.lobbyId;
  const lobby = await Lobby.fromId(lobbyId);

  if (!lobby || lobbyId != req.params.id) return res.status(406).end('lobby token is invalid');

  //add user to lobby
  lobby?.addUser(req.body.userId);
  res.status(200).send({...lobby.getClientResponse()});
};

// Join a lobby
/**
 * Body Params: id, lobbyToken, refreshToken
 */
lobby_id_router.post('/:id', validateJwt, async (req: Request, res: Response, next: NextFunction) => {
  // check if user is valid
  const userId: string = req.body.id;
  const user = await User.fromId(userId);
  if (!user) return res.status(404).json('invalid user').end();

  // check if user is already in lobby
  const lobbyId = req.params.id;
  const lobby = await Lobby.fromId(lobbyId);
  if (!lobby) return res.status(406).json('lobby doesn\'t exist').end(); // the design doc doesn't specific what error code to use if the lobby id doesn't exist
  if (lobby.participants.includes(userId)) {
    return res.status(200).send({...lobby.getClientResponse()});
  }
  next();
}, validateLobbyJwt, joinLobby);

// Get lobby specific info
/**
 * Body Params: id, refreshToken
 */
lobby_id_router.get('/:id', async (req: Request, res: Response) => {
  const lobbyId = req.params.id;
  const userId = req.body.id;
  const verified = await verifyIds(userId, lobbyId);
  if (!verified) return res.status(404).json('User or Lobby not found in database').end();
  const [_user, lobby] = verified;
  if (!lobby.participants.includes(userId)) return res.status(406).json('User is not part of the lobby').end();

  res.status(200).json(lobby.toJson());
});

// Update lobby information
/**
 * Body Params: id, name, refreshToken
 */
lobby_id_router.patch('/:id', async (req: Request, res: Response) => {
  const lobbyId = req.params.id;
  const userId = req.body.id;
  const name: string = req.body.lobbyName;
  const verified = await verifyIds(userId, lobbyId);
  if (!verified) return res.status(404).json('User or Lobby not found in database').end();
  const [_user, lobby] = verified;

  if (lobby.managerId !== userId) return res.status(406).json('User is not a manager of the lobby').end();

  // do some lobby name sanitizing maybe

  await lobby.updateName(name);

  res.status(200).end();
});

// Delete a lobby
/**
 * Body Params: id, refreshToken
 */
lobby_id_router.delete('/:id', async (req: Request, res: Response) => {
  res.status(200).json('placeholder delete');
});

// Remove another user from the lobby
/**
 * Body Params: id, refreshToken
 */
lobby_id_router.delete('/:id/user/:deleteId', async (req: Request, res: Response) => {
  const lobbyId = req.params.id;
  const deleteUserId = req.params.deleteId;
  const userId = req.body.id;
  const verified = await verifyIds(userId, lobbyId);
  if (!verified) return res.status(404).json('User or Lobby not found in database').end();
  const [_user, lobby] = verified;

  if (lobby.managerId !== userId) return res.status(406).json('User is not a manager of the lobby').end();

  const deleted = await lobby.removeUser(deleteUserId);
  if (!deleted) return res.status(500).json('user was unable to be removed from lobby').end();
  res.status(200).end();
});

const verifyIds = async (userId : string, lobbyId : string) : Promise<[User, Lobby] | null> => {
  const user = await User.fromId(userId);
  if (!user) return null;
  const lobby = await Lobby.fromId(lobbyId);
  if (!lobby) return null;
  return [user, lobby];
};
