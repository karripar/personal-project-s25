import {Request, Response, NextFunction} from 'express';
import { fetchAllFavorites, fetchFavoritesByUserId, addFavorite, removeFavorite, countFavorites} from '../models/favoriteModel';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import { Favorite } from 'hybrid-types/DBTypes';

// Get all favorites
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<Favorite[]>}
 * @description Get all favorites
 */
const favoriteListGet = async (req: Request, res: Response<Favorite[]>, next: NextFunction) => {
  try {
    const favorites = await fetchAllFavorites();
    res.json(favorites);
  } catch (err) {
    next(err);
  }
};

// Get favorites by user id
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<Favorite[]>}
 * @description Get favorites by user id
 */
const favoriteListGetByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = Number(req.params.user_id);
    const favorites = await fetchFavoritesByUserId(user_id);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
};

// Add a favorite
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Add a favorite
 */
const favoriteAdd = async (req: Request, res: Response<MessageResponse>, next: NextFunction) => {
  try {
    const user_id = res.locals.user.user_id;
    const media_id = Number(req.body.media_id);
    const result = await addFavorite(user_id, media_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};


// Get the number of favorites for a media
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<{count: number}>}
 * @description Get the number of favorites for a media
 */
const favoriteCountGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media_id = Number(req.params.media_id);
    const count = await countFavorites(media_id);
    res.json({ count });
  } catch (err) {
    next(err);
  }
};


// Remove a favorite
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Remove a favorite
 */
const favoriteRemove = async (req: Request, res: Response<MessageResponse>, next: NextFunction) => {
  try {
    const user_id = res.locals.user.user_id;
    const media_id = Number(req.body.media_id);
    const result = await removeFavorite(user_id, media_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export { favoriteListGet, favoriteListGetByUserId, favoriteAdd, favoriteRemove, favoriteCountGet };
