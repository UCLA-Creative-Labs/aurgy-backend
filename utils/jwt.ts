import { NextFunction, Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { logger } from '.';

export function genJwt(id: string): string {
  if (!process.env.TOKEN_SECRET) {
    throw new Error('Error: JWT Token Secret is missing.');
  }
  return jwt.sign({id}, process.env.TOKEN_SECRET, { expiresIn: '7d' });
}

export function validateJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401).end();

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: VerifyErrors, decoded: any) => {
    if (err) {
      logger.error(err);
      return res.status(403).json("refresh token is expired").end();
    }

    req.body.id = decoded.id;
    next();
  });
}

export function validateLobbyJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.body.lobbyToken;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401).end();

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: VerifyErrors, decoded: any) => {
    if (err) {
      logger.error(err);
      return res.status(403).json("expired token").end();
    }

    req.body.id = decoded.id;
    next();
  });
}