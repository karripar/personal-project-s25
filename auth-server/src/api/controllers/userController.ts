// Description: This file contains the functions for the user routes

import {NextFunction, Request, Response} from 'express';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcryptjs';
import {UserDeleteResponse, UserResponse} from 'hybrid-types/MessageTypes';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  modifyUser,
  getUserByUsernameWithoutPassword,
  getUserBySearch,
  modifyProfileInfo,
  postProfilePicture,
  getProfilePicture,
  putProfilePicture,
  deleteProfilePicture,
} from '../models/userModel';
import {
  ProfilePicture,
  TokenContent,
  User,
  UserWithNoPassword,
  UserWithNoSensitiveInfo,
  UserWithUnhashedPassword,
} from 'hybrid-types/DBTypes';

const salt = bcrypt.genSaltSync(12);

// Get user by username
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserWithNoPassword>}
 * @description Get user by username
 */
const userByUsernameGet = async (
  req: Request<{username: string}>,
  res: Response<UserWithNoPassword>,
  next: NextFunction,
) => {
  try {
    const user = await getUserByUsernameWithoutPassword(req.params.username);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Get all users
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserWithNoPassword[]>}
 * @description Get all users
 */
const userListGet = async (
  req: Request,
  res: Response<UserWithNoPassword[]>,
  next: NextFunction,
) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const profilePictureGet = async (
  req: Request<{user_id: string}>,
  res: Response<ProfilePicture | null>,
  next: NextFunction,
) => {
  try {
    const profilePicture = await getProfilePicture(Number(req.params.user_id));
    res.json(profilePicture);
  } catch (error) {
    next(error);
  }
};

// modify profile picture
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<ProfilePicture>}
 * @description modify profile picture
 */
const profilePicturePut = async (
  req: Request<{user_id: string}, object, ProfilePicture>,
  res: Response<ProfilePicture | null, {user: TokenContent; token: string}>,
  next: NextFunction,
) => {
  try {
    const profilePicture = req.body;
    const user_id = Number(res.locals.user.user_id);
    if (!user_id) {
      next(new CustomError('Token not found', 404));
      return;
    }

    const result = await putProfilePicture(profilePicture, user_id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get user by id
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserWithNoPassword>}
 * @description Get user by id
 */
const userGet = async (
  req: Request<{id: string}>,
  res: Response<UserWithNoPassword>,
  next: NextFunction,
) => {
  try {
    const user = await getUserById(Number(req.params.id));
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Create a new user
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserResponse>} - message and user
 * @description Create a new user
 */
const userPost = async (
  req: Request<object, object, UserWithUnhashedPassword>,
  res: Response<UserResponse>,
  next: NextFunction,
) => {
  try {
    const user = req.body;

    if (!user.password || !user.email || !user.username) {
      next(new CustomError('Missing required fields', 400));
      return;
    }

    user.password = await bcrypt.hash(user.password, salt);

    console.log(user);

    const newUser = await createUser(user);
    console.log('newUser', newUser);
    if (!newUser) {
      next(new CustomError('User not created', 500));
      return;
    }
    const response: UserResponse = {
      message: 'user created',
      user: newUser,
    };
    res.json(response);
  } catch (error) {
    console.log('error', error);
    next(new CustomError('Duplicate entry', 400));
  }
};

// Update a user
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserResponse>} - message and user
 * @description Update a user
 */
const userPut = async (
  req: Request<object, object, User>,
  res: Response<UserResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const userFromToken = res.locals.user;

    const user = req.body;
    if (user.password_hash) {
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }

    console.log('userPut', userFromToken, user);

    const result = await modifyUser(user, userFromToken.user_id);

    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    console.log('put result', result);

    const response: UserResponse = {
      message: 'user updated',
      user: result,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Update user profile
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserWithNoPassword>} - updated user
 * @description Update user profile
 */
const profilePut = async (
  req: Request<object, object, User>,
  res: Response<UserWithNoPassword>,
  next: NextFunction,
) => {
  try {
    const userFromToken = res.locals.user;

    const profileInfo = req.body;

    await modifyProfileInfo(profileInfo, userFromToken.user_id);

    const updatedProfile = await getUserById(userFromToken.user_id);
    res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

// Delete a user
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserDeleteResponse>} - message and user
 * @description Delete a user
 */
const userDelete = async (
  req: Request,
  res: Response<UserDeleteResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const userFromToken = res.locals.user;
    console.log('user from token', userFromToken);

    const result = await deleteUser(userFromToken.user_id);

    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }
    console.log(result);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update a user as an admin
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserResponse>} - message and user
 * @description Update a user as an admin
 */
const userPutAsAdmin = async (
  req: Request<{id: string}, object, User>,
  res: Response<UserResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    if (res.locals.user.level_name !== 'Admin') {
      next(new CustomError('You are not authorized to do this', 401));
      return;
    }
    const user = req.body;
    if (user.password_hash) {
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }

    const result = await modifyUser(user, Number(req.params.id));

    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: UserResponse = {
      message: 'user updated',
      user: result,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

// Delete a user as an admin
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserDeleteResponse>} - message and user
 * @description Delete a user as an admin
 */
const userDeleteAsAdmin = async (
  req: Request<{id: string}>,
  res: Response<UserDeleteResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    if (res.locals.user.level_name !== 'Admin') {
      next(new CustomError('You are not authorized to do this', 401));
      return;
    }

    const result = await deleteUser(Number(req.params.id));

    if (!result) {
      next(new CustomError('User not found', 404));
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Check if token is valid
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserResponse>} - message and user
 * @description Check if token is valid
 */
const checkToken = async (
  req: Request,
  res: Response<UserResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  const userFromToken = res.locals.user;
  // check if user exists in database
  const user = await getUserById(userFromToken.user_id);
  if (!user) {
    next(new CustomError('User not found', 404));
    return;
  }

  const message: UserResponse = {
    message: 'Token is valid',
    user: user,
  };
  res.json(message);
};

// Check if email exists
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<{available: boolean}>}
 * @description Check if email exists
 */
const checkEmailExists = async (
  req: Request<{email: string}>,
  res: Response<{available: boolean}>,
  next: NextFunction,
) => {
  try {
    console.log('test email check', req.params.email);
    const user = await getUserByEmail(req.params.email);
    res.json({available: user ? false : true});
  } catch (error) {
    next(error);
  }
};

// Check if username exists
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<{available: boolean}>}
 * @description Check if username exists
 */
const checkUsernameExists = async (
  req: Request<{username: string}>,
  res: Response<{available: boolean}>,
  next: NextFunction,
) => {
  try {
    const user = await getUserByUsername(req.params.username);
    res.json({available: user ? false : true});
  } catch (error) {
    next(error);
  }
};

// Post profile picture
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<{message: string; profile_picture_id: number}>}
 * @description Post profile picture
 */
const profilePicturePost = async (
  req: Request<
    object,
    object,
    Omit<ProfilePicture, 'profile_picture_id' | 'created_at'>
  >,
  res: Response<
    {message: string; profile_picture_id: number},
    {user: TokenContent}
  >,
  next: NextFunction,
) => {
  try {
    req.body.user_id = res.locals.user.user_id;

    const response = await postProfilePicture(req.body);
    res.json({
      message: 'Profile picture uploaded',
      profile_picture_id: response.profile_picture_id,
    });
  } catch (error) {
    next(error);
  }
};

const profilePictureDelete = async (
  req: Request<{user_id: string}>,
  res: Response<{message: string}>,
  next: NextFunction,
) => {
  try {
    const user_id = Number(res.locals.user.user_id);
    const token = res.locals.token;
    const result = await deleteProfilePicture(user_id, token);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Search for users by username
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserWithNoSensitiveInfo[]>}
 * @description Search for users by username (case insensitive)
 */
const searchByUsername = async (
  req: Request<{search: string}>,
  res: Response<UserWithNoSensitiveInfo[]>,
  next: NextFunction,
) => {
  try {
    const search = req.query.username as string;
    const users = await getUserBySearch(search);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export {
  userListGet,
  userGet,
  userPost,
  userPut,
  userDelete,
  userPutAsAdmin,
  userDeleteAsAdmin,
  checkToken,
  checkEmailExists,
  checkUsernameExists,
  userByUsernameGet,
  searchByUsername,
  profilePut,
  profilePicturePost,
  profilePictureGet,
  profilePicturePut,
  profilePictureDelete,
};
