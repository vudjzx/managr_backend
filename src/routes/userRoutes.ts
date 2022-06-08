import express from 'express';
import {
  authenticateUser,
  changePassword,
  confirmToken,
  confirmUser,
  registerUser,
  resetPassword,
  profile,
} from '../controllers/userController';
import checkAuth from '../middlware/checkAuth';

const userRouter = express.Router();

// Auth and registration
userRouter.post('/', registerUser);
userRouter.post('/login', authenticateUser);
userRouter.get('/confirm/:token', confirmUser);
userRouter.post('/reset', resetPassword);
userRouter.route('/reset/:token').get(confirmToken).post(changePassword);

userRouter.get('/profile', checkAuth, profile);

export default userRouter;
