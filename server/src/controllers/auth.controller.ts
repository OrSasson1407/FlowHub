import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { User } from '../models';
import { signAuthToken, publicUser } from '../services/token.service';
import { asyncHandler } from '../utils/async-handler';
import { HttpError } from '../utils/http-error';
import { requireString } from '../utils/validators';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const email = requireString(req.body, 'email').toLowerCase();
  const password = requireString(req.body, 'password', 128);

  if (password.length < 8) {
    throw new HttpError(400, 'password must be at least 8 characters');
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new HttpError(409, 'A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash });

  res.status(201).json({ user: publicUser(user), token: signAuthToken(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const email = requireString(req.body, 'email').toLowerCase();
  const password = requireString(req.body, 'password', 128);

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw new HttpError(401, 'Invalid email or password');
  }

  res.json({ user: publicUser(user), token: signAuthToken(user) });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user!.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  res.json({ user: publicUser(user) });
});
