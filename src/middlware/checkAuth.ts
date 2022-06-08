import User from '../models/User';
import {Request, NextFunction, Response} from 'express';
import jwt from 'jsonwebtoken';
import {IDecodedToken} from '../interfaces/users/IUser';

const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded: IDecodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET || '',
      ) as unknown as IDecodedToken;
      req.user = await User.findById(decoded.id).select(
        '-password -token -confirmed -__v -createdAt -updatedAt',
      );
    } catch (error) {
      return res.status(404).json({msg: 'Token inválido'});
    }
  }
  next();
};

export default checkAuth;
