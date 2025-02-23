import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {NextFunction, Request, Response} from 'express';
import CustomError from '../../classes/CustomError';
import {LoginResponse} from 'hybrid-types/MessageTypes';
import {getUserByEmail} from '../models/userModel';
import {UserWithLevel, TokenContent} from 'hybrid-types/DBTypes';

const login = async (
  req: Request<object, object, {email: string; password: string}>,
  res: Response<LoginResponse>,
  next: NextFunction,
) => {
  try {
    const {email, password} = req.body;
    const user = await getUserByEmail(email);

    if (!bcrypt.compareSync(password, user.password_hash)) {
      next(new CustomError('Incorrect username/password', 403));
      return;
    }

    if (!process.env.JWT_SECRET) {
      next(new CustomError('JWT secret not set', 500));
      return;
    }

    const outUser: Omit<UserWithLevel, 'password_hash'> = {
      user_id: user.user_id,
      username: user.username,
      bio: user.bio,
      email: user.email,
      created_at: user.created_at,
      level_name: user.level_name,
    };

    const tokenContent: TokenContent = {
      user_id: user.user_id,
      level_name: user.level_name,
    };

    const token = jwt.sign(tokenContent, process.env.JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: outUser,
    });
  } catch (error) {
    next(error);
  }
};

export {login};
