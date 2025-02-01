import express from 'express';
import {
  likeListGet,
  likeListByMaterialIdGet,
  likeListByUserIdGet,
  likePost,
  likeDelete,
  likeCountByMaterialIdGet,
  likeByMaterialIdAndUserIdGet,
} from '../controllers/likeController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(likeListGet)
  .post(
    authenticate,
    body('material_id').isInt({min: 1}).toInt(),
    validationErrors,
    likePost,
  );

router
  .route('/bymedia/:material_id')
  .get(
    param('material_id').isInt({min: 1}).toInt(),
    validationErrors,
    likeListByMaterialIdGet,
  );

router
  .route('/bymedia/user/:material_id')
  .get(
    authenticate,
    param('material_id').isInt({min: 1}).toInt(),
    validationErrors,
    likeByMaterialIdAndUserIdGet,
  );

router
  .route('/byuser/:id')
  .get(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    likeListByUserIdGet,
  );

router
  .route('/count/:id')
  .get(
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    likeCountByMaterialIdGet,
  );

router
  .route('/:id')
  .delete(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    likeDelete,
  );

export default router;
