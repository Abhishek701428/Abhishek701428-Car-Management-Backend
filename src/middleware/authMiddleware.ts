import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET_KEY || '');
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};




