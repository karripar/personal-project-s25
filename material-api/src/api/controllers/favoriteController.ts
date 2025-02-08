import {Request, Response, NextFunction} from 'express';
import { fetchAllFavorites, fetchFavoritesByUserId, addFavorite, removeFavorite, countFavorites} from '../models/favoriteModel';
import {MessageResponse} from 'hybrid-types/MessageTypes';

// Get all favorites
const favoriteListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const favorites = await fetchAllFavorites();
    res.json(favorites);
  } catch (err) {
    next(err);
  }
};

// Get favorites by user id
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
const favoriteAdd = async (req: Request, res: Response<MessageResponse>, next: NextFunction) => {
  try {
    const user_id = res.locals.user.user_id;
    const material_id = Number(req.body.material_id);
    const result = await addFavorite(user_id, material_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};


// Get the number of favorites for a material
const favoriteCountGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const material_id = Number(req.params.material_id);
    const count = await countFavorites(material_id);
    res.json({ count });
  } catch (err) {
    next(err);
  }
};


// Remove a favorite
const favoriteRemove = async (req: Request, res: Response<MessageResponse>, next: NextFunction) => {
  try {
    const user_id = res.locals.user.user_id;
    const material_id = Number(req.body.material_id);
    const result = await removeFavorite(user_id, material_id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export { favoriteListGet, favoriteListGetByUserId, favoriteAdd, favoriteRemove, favoriteCountGet };
