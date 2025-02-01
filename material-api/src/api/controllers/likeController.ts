import {Request, Response, NextFunction} from 'express';
import {
  fetchAllLikes,
  fetchLikesByMaterialId,
  fetchLikesByUserId,
  postLike,
  deleteLike,
  fetchLikesCountByMaterialId,
  fetchLikeByMaterialIdAndUserId,
} from '../models/likeModel';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import {Like, TokenContent} from 'hybrid-types/DBTypes';

const likeListGet = async (
  req: Request,
  res: Response<Like[]>,
  next: NextFunction,
) => {
  try {
    const likes = await fetchAllLikes();
    res.json(likes);
  } catch (error) {
    next(error);
  }
};

const likeListByMaterialIdGet = async (
  req: Request<{material_id: string}>,
  res: Response<Like[]>,
  next: NextFunction,
) => {
  try {
    const likes = await fetchLikesByMaterialId(Number(req.params.material_id));
    res.json(likes);
  } catch (error) {
    next(error);
  }
};

const likeListByUserIdGet = async (
  req: Request<{id: string}>,
  res: Response<Like[]>,
  next: NextFunction,
) => {
  try {
    const likes = await fetchLikesByUserId(Number(req.params.id));
    res.json(likes);
  } catch (error) {
    next(error);
  }
};

const likePost = async (
  req: Request<{}, {}, {material_id: string}>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const result = await postLike(
      Number(req.body.material_id),
      res.locals.user.user_id,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const likeDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const result = await deleteLike(
      Number(req.params.id),
      res.locals.user.user_id,
      res.locals.user.level_name,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Fetch likes count by media id
const likeCountByMaterialIdGet = async (
  req: Request<{id: string}>,
  res: Response<{count: number}>,
  next: NextFunction,
) => {
  try {
    const count = await fetchLikesCountByMaterialId(Number(req.params.id));
    res.json({count});
  } catch (error) {
    next(error);
  }
};

const likeByMaterialIdAndUserIdGet = async (
  req: Request<{material_id: string}>,
  res: Response<Like, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const result = await fetchLikeByMaterialIdAndUserId(
      Number(req.params.material_id),
      res.locals.user.user_id,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export {
  likeListGet,
  likeListByMaterialIdGet,
  likeListByUserIdGet,
  likePost,
  likeDelete,
  likeCountByMaterialIdGet,
  likeByMaterialIdAndUserIdGet,
};
