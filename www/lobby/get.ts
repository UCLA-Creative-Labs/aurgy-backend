import {Request, Response} from 'express';

export async function GET_(req: Request, res: Response): Promise<void> {
  return res.status(200).json({ message: "Filler." });
}