import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models';

export const signAuthToken = (user: User) => {
  const options = {
    subject: user.id,
    expiresIn: env.jwtExpiresIn,
  } as SignOptions;

  return jwt.sign({ email: user.email }, env.jwtSecret, {
    ...options,
  });
};

export const publicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  createdAt: user.createdAt,
});
