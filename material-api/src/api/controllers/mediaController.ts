import {Request, Response, NextFunction} from 'express';
import {
  fetchAllMedia,
  fetchMediaById,
  postMedia,
  putMedia,
  deleteMedia,
  fetchMediaByUserId,
  fetchMostLikedMedia,
  fetchFollowedMedia,
  fetchSearchedMedia,
  fetchMediaByUsername,
  fetchMediaByTagname,
} from '../models/mediaModel';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import {MediaItem, TokenContent} from 'hybrid-types/DBTypes';
import CustomError from '../../classes/CustomError';
import {ERROR_MESSAGES} from '../../utils/errorMessages';

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaItem[]>}
 * @description Get all media items
 */
const mediaListGet = async (
  req: Request<{}, {}, {page: string; limit: string}>,
  res: Response<MediaItem[]>,
  next: NextFunction,
) => {
  try {
    const {page, limit} = req.query;
    const Media = await fetchAllMedia(Number(page), Number(limit));
    res.json(Media);
  } catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaItem>}
 * @description Get a media item by ID
 */
const mediaGet = async (
  req: Request<{id: string}>,
  res: Response<MediaItem>,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const Media = await fetchMediaById(id);
    res.json(Media);
  } catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Create a new media item
 */
const mediaPost = async (
  req: Request<{}, {}, Omit<MediaItem, 'media_id' | 'created_at'>>,
  res: Response<{ message: string; media_id: number }, { user: TokenContent }>,
  next: NextFunction
) => {
  try {
    // add user_id to Media object from token
    req.body.user_id = res.locals.user.user_id;

    const response = await postMedia(req.body); // assuming postMedia returns the media item with media_id
    res.json({
      message: 'Media created',
      media_id: response.media_id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Delete a media item by ID
 */
const mediaDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse, {user: TokenContent; token: string}>,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteMedia(
      id,
      res.locals.user.user_id,
      res.locals.token,
      res.locals.user.level_name,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Update a media item by ID
 */
const mediaPut = async (
  req: Request<{id: string}, {}, Pick<MediaItem, 'title' | 'description'>>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    await putMedia(
      req.body,
      id,
      res.locals.user.user_id,
      res.locals.user.level_name,
    );
    res.json({message: 'Media updated'});
  } catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaItem[]>}
 * @description Get all media items by user ID from token
 */
const mediaByTokenGet = async (
  req: Request<{user_id: string}>,
  res: Response<MediaItem[]>,
  next: NextFunction,
) => {
  console.log('res.locals.user', res.locals.user);
  try {
    if (!res.locals.user || !res.locals.user.user_id) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.NO_ID, 400);
    }

    const user_id = res.locals.user?.user_id;
    if (!user_id) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.NO_ID, 400);
    }
    const media = await fetchMediaByUserId(user_id);
    res.json(media);
  } catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaItem[]>}
 * @description Get all media items by username
 */
const mediaByUsernameGet = async (
  req: Request<{username: string}>,
  res: Response<MediaItem[]>,
  next: NextFunction,
) => {
  try {
    const username = req.params.username;
    if (!username) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.NO_USERNAME, 400);
    }

    const media = await fetchMediaByUsername(username);
    res.json(media);
  } catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaItem[]>}
 * @description Get all media items by tagname
 */
const mediaByTagnameGet = async (
  req: Request<{tagname: string}>,
  res: Response<MediaItem[]>,
  next: NextFunction,
) => {
  try {
    const tagname = req.params.tagname;
    if (!tagname) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.NO_TAG, 400);
    }

    const media = await fetchMediaByTagname(tagname);
    res.json(media);
  }
  catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaItem[]>}
 * @description Get all media items by user ID
 */
const mediaByUserGet = async (
  req: Request<{user_id: string}>,
  res: Response<MediaItem[], {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const user_id = Number(req.params.user_id) || null;

    if (!user_id) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.NO_ID, 400);
    }


    const media = await fetchMediaByUserId(user_id);
    res.json(media);
  } catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaItem>}
 * @description Get all media items by most liked
 */
const mediaListMostLikedGet = async (
  req: Request,
  res: Response<MediaItem>,
  next: NextFunction,
) => {
  try {
    const Media = await fetchMostLikedMedia();
    res.json(Media);
  } catch (error) {
    next(error);
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaItem[]>}
 * @description Get all media items by followed users
 */
const mediaListFollowedGet = async (
  req: Request,
  res: Response<MediaItem[]>,
  next: NextFunction,
) => {
  try {
    const id = res.locals.user.user_id;
    if (isNaN(id)) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.NO_ID, 400);
    }
    const Media = await fetchFollowedMedia(id);
    res.json(Media);
  } catch (error) {
    next(error);
  }
}

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaItem[]>}
 * @description Get all media items with search term and category
 */
const mediaWithSearchGet = async (
  req: Request<{}, {}, {}, { page?: string; limit?: string; search?: string; searchBy?: string }>,
  res: Response<MediaItem[]>,
  next: NextFunction
) => {
  try {
    // Extract and validate query parameters with default values
    console.log("query", req.query);
    const page = req.query.page || '1';
    const limit = req.query.limit || '10';
    const search = req.query.search || '';
    const searchBy = req.query.searchBy || 'title';

    console.log('search after unpacking', search);
    // Parse page and limit as integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Check if pagination values are valid
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.INVALID_PAGINATION, 400);
    }

    // Define allowed search fields for validation
    const allowedFields = ["title", "description", "tags"];
    if (!allowedFields.includes(searchBy)) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.INVALID_SEARCH_FIELD, 400);
    }

    let media: MediaItem[];
    console.log('Search terms', {search, searchBy, page, limit});

    // If a search term is provided, fetch filtered media
    if (search.trim()) {
      media = await fetchSearchedMedia(search, searchBy, pageNum, limitNum);
    } else {
      // Otherwise, fetch all media without filtering
      media = await fetchAllMedia(pageNum, limitNum);
    }

    // Respond with the media items (either filtered or all)
    res.json(media);
  } catch (error) {
    // Pass errors to the error handling middleware
    next(error);
  }
};



export {
  mediaListGet,
  mediaGet,
  mediaPost,
  mediaDelete,
  mediaPut,
  mediaByUserGet,
  mediaListMostLikedGet,
  mediaListFollowedGet,
  mediaWithSearchGet,
  mediaByTokenGet,
  mediaByUsernameGet,
  mediaByTagnameGet,
};
