import {Request, Response} from 'express';

export async function POST_create(req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: "Filler." });
}