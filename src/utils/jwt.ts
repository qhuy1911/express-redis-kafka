import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

const JWT_SECRET: jwt.Secret =
  env.JWT_SECRET ??
  (() => {
    throw new Error('JWT_SECRET is not defined');
  })();

const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '1d';

export const signToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } satisfies SignOptions);
};

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, JWT_SECRET) as T;
};
