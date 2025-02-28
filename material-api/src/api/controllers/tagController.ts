import {Request, Response, NextFunction} from 'express';
import {
  fetchAllTags,
  postTags,
  fetchTagsByMediaId,
  fetchFilesByTagById,
  deleteTag,
  deleteTagFromMedia,
} from '../models/tagModel';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import {MediaItem, Tag, TagResponse, TokenContent} from 'hybrid-types/DBTypes';
import CustomError from '../../classes/CustomError';

const tagListGet = async (
  req: Request,
  res: Response<Tag[]>,
  next: NextFunction,
) => {
  try {
    const tags = await fetchAllTags();
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

const tagListByMediaIdGet = async (
  req: Request<{id: string}>,
  res: Response<Tag[]>,
  next: NextFunction,
) => {
  try {
    const tags = await fetchTagsByMediaId(Number(req.params.id));
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

const tagPost = async (
  req: Request<{}, {}, {tags: string[]; media_id: string}>,
  res: Response<TagResponse>,
  next: NextFunction,
) => {
  try {
    const tags = req.body.tags;
    const media_id = Number(req.body.media_id);

    if (!Array.isArray(tags) || tags.length === 0) {
      throw new CustomError('Tags must be an array with at least one tag', 400);
    }

    const insertedTags = await postTags(tags, media_id);
    res.json({ message: 'Tags added successfully', tags: insertedTags });

  } catch (error) {
    next(error);
  }
};

const tagFilesByTagGet = async (
  req: Request<{tag_id: string}>,
  res: Response<MediaItem[]>,
  next: NextFunction,
) => {
  try {
    const files = await fetchFilesByTagById(Number(req.params.tag_id));
    res.json(files);
  } catch (error) {
    next(error);
  }
};

const tagDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    if (res.locals.user.level_name !== 'Admin') {
      throw new CustomError('Not authorized', 401);
    }
    const result = await deleteTag(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const tagDeleteFromMedia = async (
  req: Request<{tag_id: string; media_id: string}>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const result = await deleteTagFromMedia(
      Number(req.params.tag_id),
      Number(req.params.media_id),
      res.locals.user.user_id,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export {
  tagListGet,
  tagListByMediaIdGet,
  tagPost,
  tagDelete,
  tagFilesByTagGet,
  tagDeleteFromMedia,
};
