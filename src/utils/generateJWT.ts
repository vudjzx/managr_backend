import jwt from 'jsonwebtoken';
import {IUser} from '../interfaces/users/IUser';
import {ObjectId} from 'mongodb';

const generateJWT = (id: ObjectId) => {
  const token = jwt.sign(
    {
      id: id,
    },
    process.env.JWT_SECRET || '',
    {expiresIn: '30d'},
  );
  return token;
};

export default generateJWT;
