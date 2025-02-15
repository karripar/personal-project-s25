import express from 'express';
import { favoriteListGet, favoriteListGetByUserId, favoriteAdd, favoriteRemove, favoriteCountGet} from '../controllers/favoriteController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const favoriteRouter = express.Router();

favoriteRouter
  .route('/')
  .get(authenticate, favoriteListGet)
  .post(
    authenticate,
    body('media_id').notEmpty().isInt({min: 1}).toInt(),
    validationErrors,
    favoriteAdd,
);

favoriteRouter
  .route('/byuser/:user_id')
  .get(
    param('user_id').isInt({min: 1}).toInt(),
    validationErrors,
    favoriteListGetByUserId,
  );

favoriteRouter
  .route('/:media_id')
  .get(
    param('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    favoriteCountGet,
  )
  .delete(
    authenticate,
    param('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    favoriteRemove,
  );

export { favoriteRouter };


