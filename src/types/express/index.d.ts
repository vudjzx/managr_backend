import express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: (IUser & {_id: any}) | null;
    }
  }
}
