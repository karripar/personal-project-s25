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
  fetchSearchedMedia
} from '../models/mediaModel';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import {MediaItem, TokenContent} from 'hybrid-types/DBTypes';
import CustomError from '../../classes/CustomError';
import {ERROR_MESSAGES} from '../../utils/errorMessages';

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

const mediaPost = async (
  req: Request<{}, {}, Omit<MediaItem, 'Media_id' | 'created_at'>>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    // add user_id to Media object from token
    req.body.user_id = res.locals.user.user_id;
    await postMedia(req.body);
    res.json({message: 'Media created'});
  } catch (error) {
    next(error);
  }
};

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

const mediaByTokenGet = async (
  req: Request,
  res: Response<MediaItem[], {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const Media = await fetchMediaByUserId(res.locals.user.user_id);
    res.json(Media);
  } catch (error) {
    next(error);
  }
};

const mediaByUserGet = async (
  req: Request<{user_id: string}>,
  res: Response<MediaItem[], {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const user_id = res.locals.user.user_id || Number(req.params.user_id);
    if (isNaN(user_id)) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.NO_ID, 400);
    }

    const Media = await fetchMediaByUserId(user_id);
    res.json(Media);
  } catch (error) {
    next(error);
  }
};

const mediaListMostLikedGet = async (
  req: Request,
  res: Response<MediaItem[]>,
  next: NextFunction,
) => {
  try {
    const Media = await fetchMostLikedMedia();
    res.json([Media]);
  } catch (error) {
    next(error);
  }
};

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

const mediaWithSearchGet = async (
  req: Request<{}, {}, { page: string; limit: string; search: string }>,
  res: Response<MediaItem[]>,
  next: NextFunction
) => {
  try {
    // Destructure query parameters with proper conversion
    const { page, limit} = req.query;
    const { search } = req.query;

    // Validate parameters (ensure page, limit are integers and search is a string)
    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 10;

    // Check if search string is empty
    if (!search) {
      const Media = await fetchAllMedia(pageNum, limitNum);
      res.json(Media);
    }

    // Fetch the data from the database
    const Media = await fetchSearchedMedia(search as string, pageNum, limitNum);
    res.json(Media);
  } catch (error) {
    next(error); // Pass any error to the error handler middleware
  }
}

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
};
