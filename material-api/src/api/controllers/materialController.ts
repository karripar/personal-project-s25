import {Request, Response, NextFunction} from 'express';
import {
  fetchAllMaterial,
  fetchMaterialById,
  postMaterial,
  deleteMaterial,
  fetchMostLikedMaterial,
  fetchMaterialByUserId,
  fetchFollowedMaterial,
  putMaterial,
  fetchSearchedMaterial,
} from '../models/materialModel';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import {StudyMaterial, TokenContent} from 'hybrid-types/DBTypes';
import CustomError from '../../classes/CustomError';
import {ERROR_MESSAGES} from '../../utils/errorMessages';

const materialListGet = async (
  req: Request<{}, {}, {page: string; limit: string}>,
  res: Response<StudyMaterial[]>,
  next: NextFunction,
) => {
  try {
    const {page, limit} = req.query;
    const media = await fetchAllMaterial(Number(page), Number(limit));
    res.json(media);
  } catch (error) {
    next(error);
  }
};

const materialGet = async (
  req: Request<{id: string}>,
  res: Response<StudyMaterial>,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const media = await fetchMaterialById(id);
    res.json(media);
  } catch (error) {
    next(error);
  }
};

const materialPost = async (
  req: Request<{}, {}, Omit<StudyMaterial, 'material_id' | 'created_at'>>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    // add user_id to media object from token
    req.body.user_id = res.locals.user.user_id;
    await postMaterial(req.body);
    res.json({message: 'Media created'});
  } catch (error) {
    next(error);
  }
};

const materialDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse, {user: TokenContent; token: string}>,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const result = await deleteMaterial(
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

const materialPut = async (
  req: Request<{id: string}, {}, Pick<StudyMaterial, 'title' | 'description'>>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    await putMaterial(
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

const materialByUserGet = async (
  req: Request<{id: string}>,
  res: Response<StudyMaterial[], {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id) || res.locals.user.user_id;
    if (isNaN(id)) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.NO_ID, 400);
    }

    const media = await fetchMaterialByUserId(id);
    res.json(media);
  } catch (error) {
    next(error);
  }
};

const materialListMostLikedGet = async (
  req: Request,
  res: Response<StudyMaterial[]>,
  next: NextFunction,
) => {
  try {
    const media = await fetchMostLikedMaterial();
    res.json([media]);
  } catch (error) {
    next(error);
  }
};

const materialListFollowedGet = async (
  req: Request,
  res: Response<StudyMaterial[]>,
  next: NextFunction,
) => {
  try {
    const id = res.locals.user.user_id;
    if (isNaN(id)) {
      throw new CustomError(ERROR_MESSAGES.MEDIA.NO_ID, 400);
    }
    const media = await fetchFollowedMaterial(id);
    res.json(media);
  } catch (error) {
    next(error);
  }
}

const materialWithSearchGet = async (
  req: Request<{}, {}, { page: string; limit: string; search: string }>,
  res: Response<StudyMaterial[]>,
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
      const media = await fetchAllMaterial(pageNum, limitNum);
      res.json(media);
    }

    // Fetch the data from the database
    const media = await fetchSearchedMaterial(search as string, pageNum, limitNum);
    res.json(media);
  } catch (error) {
    next(error); // Pass any error to the error handler middleware
  }
}

export {
  materialListGet,
  materialGet,
  materialPost,
  materialPut,
  materialDelete,
  materialByUserGet,
  materialListMostLikedGet,
  materialListFollowedGet,
  materialWithSearchGet
};
