import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { auditLog } from '../utils/logger';

export const auditMiddleware = (action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userId = req.user?.userId || 'anonymous';
    auditLog(action, userId, {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
    });
    next();
  };
};
