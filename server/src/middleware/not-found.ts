import { Request, Response } from 'express';

export const routeNotFound = (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};
