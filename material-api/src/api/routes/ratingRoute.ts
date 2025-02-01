import express from 'express';
import {
  ratingListGet,
  ratingListByMaterialIdGet,
  ratingListByUserGet,
  ratingPost,
  ratingDelete,
  ratingAverageByMaterialIdGet,
} from '../controllers/ratingController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(ratingListGet)
  .post(
    authenticate,
    body('rating_value').notEmpty().isInt({min: 1, max: 5}).toInt(),
    body('material_id').notEmpty().isInt({min: 1}).toInt(),
    validationErrors,
    ratingPost,
  );

router
  .route('/bymedia/:id')
  .get(
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    ratingListByMaterialIdGet,
  );

router.route('/byuser').get(authenticate, ratingListByUserGet);

router
  .route('/average/:id')
  .get(
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    ratingAverageByMaterialIdGet,
  );

router
  .route('/:id')
  .delete(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    ratingDelete,
  );

export default router;
