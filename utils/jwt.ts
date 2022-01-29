import { NextFunction, Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { logger } from '.';

export function genJwt(id: string): string {
  if (!process.env.TOKEN_SECRET) {
    throw new Error('Error: JWT Token Secret is missing.');
  }
  return jwt.sign({id}, process.env.TOKEN_SECRET, { expiresIn: '7d' });
}

interface validateJwtOptions {
  req: Request;
  res: Response;
  next: NextFunction;
  token?: string;
  key: string;
}

function validateJwtToken({req, res, next, token, key}: validateJwtOptions) {
  if (token == null) return res.sendStatus(401).end();

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: VerifyErrors, decoded: any) => {
    if (err) {
      logger.error(err);
      return res.status(403).json('token is expired').end();
    }
    req.body[key] = decoded.id;
    next();
  });
}

export function validateJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  const validateJwtOpts = {
    req: req,
    res: res,
    next: next,
    token: token,
    key: 'id',
  };
  validateJwtToken(validateJwtOpts);
}

export function validateLobbyJwt(req: Request, res: Response, next: NextFunction) {
  const token = req.body.lobbyToken;

  const validateJwtOpts = {
    req: req,
    res: res,
    next: next,
    token: token,
    key: 'lobbyId',
  };
  validateJwtToken(validateJwtOpts);
}
