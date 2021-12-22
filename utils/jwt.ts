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

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: VerifyErrors, decoded: any) => {
    if (err) {
      logger.error(err);
      return res.sendStatus(403).end();
    }

    req.body.id = decoded.id;
    next();
  });
}
