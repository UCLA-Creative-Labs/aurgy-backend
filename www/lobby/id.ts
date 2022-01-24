import { Router, Request, Response, NextFunction } from 'express';
// import { nextTick } from 'process';
import { User } from '../../lib';
import { Lobby } from '../../lib/lobby';
import { validateJwt, validateLobbyJwt } from '../../utils/jwt';

export const lobby_id_router = Router();

const joinLobby = async (req: Request, res: Response, next: NextFunction) => {
  // check if token is valid
  const lobbyId: string = req.body.id;
  const lobby = await Lobby.fromId(lobbyId);

  if (!lobby || lobbyId != req.params.id) return res.status(406).end("lobby token is invalid");
  
  //add user to lobby
  lobby?.addUser(req.body.userId);
  res.status(200).send({...lobby.getClientResponse()});
}

// Join a lobby
/**
 * Body Params: id, lobbyToken, refreshToken
 */
lobby_id_router.post('/:id', validateJwt, async (req: Request, res: Response, next: NextFunction) => {
  // check if user is valid
  const userId: string = req.body.id;
  const user = await User.fromId(userId);
  if (!user) return res.status(404).json("invalid user").end();

  // check i user is already in lobby
  const lobbyId = req.params.id;
  const lobby = await Lobby.fromId(lobbyId);
  if (!lobby) return res.status(406).json("lobby doesn't exist").end(); // the design doc doesn't specific what error code to use if the lobby id doesn't exist
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
  res.status(200).json('placeholder get');
});

// Update lobby information
/**
 * Body Params: id, name, refreshToken
 */
lobby_id_router.patch('/:id', async (req: Request, res: Response) => {
  res.status(200).json('placeholder patch');
});

// Delete a lobby
/**
 * Body Params: id, refreshToken
 */
lobby_id_router.delete('/:id', async (req: Request, res: Response) => {
  res.status(200).json('placeholder delete');
});
