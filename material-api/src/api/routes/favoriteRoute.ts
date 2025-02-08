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
    body('material_id').notEmpty().isInt({min: 1}).toInt(),
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
  .route('/:material_id')
  .get(
    param('material_id').isInt({min: 1}).toInt(),
    validationErrors,
    favoriteCountGet,
  )
  .delete(
    authenticate,
    param('material_id').isInt({min: 1}).toInt(),
    validationErrors,
    favoriteRemove,
  );

export { favoriteRouter };


