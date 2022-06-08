import {Document} from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  token?: string;
  confirmed?: boolean;
  comparePassword: (password: string) => Promise<boolean>;
}

export interface IDecodedToken {
  id: string;
  iat: string;
  exp: string;
}
