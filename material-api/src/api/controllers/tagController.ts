import {Request, Response, NextFunction} from 'express';
import {
  fetchAllTags,
  postTag,
  fetchTagsByMaterialId,
  fetchFilesByTagById,
  deleteTag,
  deleteTagFromMaterial,
} from '../models/tagModel';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import {StudyMaterial, Tag, TagResult, TokenContent} from 'hybrid-types/DBTypes';
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

const tagListByMaterialIdGet = async (
  req: Request<{id: string}>,
  res: Response<TagResult[]>,
  next: NextFunction,
) => {
  try {
    const tags = await fetchTagsByMaterialId(Number(req.params.id));
    res.json(tags);
  } catch (error) {
    next(error);
  }
};

const tagPost = async (
  req: Request<{}, {}, {tag_name: string; material_id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction,
) => {
  try {
    const result = await postTag(req.body.tag_name, Number(req.body.material_id));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const tagFilesByTagGet = async (
  req: Request<{tag_id: string}>,
  res: Response<StudyMaterial[]>,
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

const tagDeleteFromMaterial = async (
  req: Request<{tag_id: string; material_id: string}>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const result = await deleteTagFromMaterial(
      Number(req.params.tag_id),
      Number(req.params.material_id),
      res.locals.user.user_id,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export {
  tagListGet,
  tagListByMaterialIdGet,
  tagPost,
  tagDelete,
  tagFilesByTagGet,
  tagDeleteFromMaterial,
};
