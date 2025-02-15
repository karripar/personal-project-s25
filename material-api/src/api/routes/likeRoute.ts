import express from 'express';
import {
  likeListGet,
  likeListByMediaIdGet,
  likeListByUserIdGet,
  likePost,
  likeDelete,
  likeCountByMediaIdGet,
  likeByMediaIdAndUserIdGet,
} from '../controllers/likeController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const likeRouter = express.Router();

likeRouter
  .route('/')
  .get(likeListGet)
  .post(
    authenticate,
    body('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    likePost,
  );

likeRouter
  .route('/bymedia/:media_id')
  .get(
    param('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    likeListByMediaIdGet,
  );

likeRouter
  .route('/bymedia/user/:media_id')
  .get(
    authenticate,
    param('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    likeByMediaIdAndUserIdGet,
  );

likeRouter
  .route('/byuser/:id')
  .get(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    likeListByUserIdGet,
  );

likeRouter
  .route('/count/:id')
  .get(
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    likeCountByMediaIdGet,
  );

likeRouter
  .route('/:id')
  .delete(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    likeDelete,
  );

export default likeRouter;
