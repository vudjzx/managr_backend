import {JwtPayload} from 'jsonwebtoken';
import {Document} from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  token?: string;
  confirmed?: boolean;
  comparePassword: (password: string) => Promise<boolean>;
}

export interface IDecodedToken extends JwtPayload {
  id: string;
  iat: number;
  exp: number;
}
