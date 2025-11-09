import express from 'express';
import {
  createRefreshToken,
  handleGoogleCallback,
  handleLogout,
  initiateGoogleAuth,
  loginUser,
  registerUser,
} from '../controllers/authController';

const authRouter = express.Router();

authRouter.post('/register', registerUser);

authRouter.post('/login', loginUser);

authRouter.get('/refresh', createRefreshToken);

authRouter.post('/logout', handleLogout);

authRouter.get('/google', initiateGoogleAuth);
authRouter.get('/google/callback', handleGoogleCallback);

export default authRouter;
