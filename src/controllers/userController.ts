import {Request, NextFunction, Response} from 'express';
import User from '../models/User';
import {emailHandler, resetPasswordHandler} from '../utils/emailHandler';
import generateId from '../utils/generateId';
import generateJWT from '../utils/generateJWT';

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const {email} = req.body;
  const isDuplicated = await User.findOne({email});

  if (isDuplicated) return res.status(400).json({msg: 'User already exists'});

  try {
    const user = new User(req.body);
    user.token = generateId();
    await user.save();
    emailHandler(user.name, user.email, user.token);
    res.status(201).json({msg: 'User created, you can login now.'});
  } catch (error) {
    res.status(400).send(error);
  }
};

const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const {email, password} = req.body;

  const user = await User.findOne({email});
  if (!user) return res.status(404).json({msg: 'User not found'});
  if (!user.confirmed) return res.status(400).json({msg: 'User not confirmed'});

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({msg: 'Invalid password'});
  if (isMatch) {
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateJWT(user._id),
    });
  }
};

const confirmUser = async (req: Request, res: Response, next: NextFunction) => {
  const {token} = req.params;
  const user = await User.findOne({token});
  if (!user) return res.status(404).json({msg: 'Invalid token'});
  if (user.confirmed) return res.status(400).json({msg: 'User already confirmed'});
  user.confirmed = true;
  user.token = '';
  await user.save();
  res.status(200).json({msg: 'User confirmed'});
};

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const {email} = req.body;
  const user = await User.findOne({email});
  if (!user || !user.confirmed)
    return res.status(404).json({msg: 'User not found or not confirmed, sorry.'});
  try {
    user.token = generateId();
    await user.save();
    resetPasswordHandler(user.name, user.email, user.token);
    res.status(200).json({msg: 'New token sent to your email with instructions.'});
  } catch (error) {
    res.status(400).send(error);
  }
};

const confirmToken = async (req: Request, res: Response, next: NextFunction) => {
  const {token} = req.params;
  const user = await User.findOne({token});
  if (!user || !user.confirmed) return res.status(404).json({msg: 'Token not valid'});
  res.status(200).json({msg: 'Token is valid'});
};

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const {token} = req.params;
  const {password} = req.body;
  const user = await User.findOne({token});
  if (!user) return res.status(404).json({msg: 'Token not valid'});
  try {
    user.password = password;
    user.token = '';
    await user.save();
    res.status(200).json({msg: 'Password changed'});
  } catch (error) {
    res.status(400).send(error);
  }
};

const profile = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  res.status(200).json(user);
};
export {
  registerUser,
  authenticateUser,
  confirmUser,
  resetPassword,
  confirmToken,
  changePassword,
  profile,
};
