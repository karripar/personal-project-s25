import express from 'express';
import {
  ratingListGet,
  ratingListByMediaIdGet,
  ratingListByUserGet,
  ratingPost,
  ratingDelete,
  ratingAverageByMediaIdGet,
} from '../controllers/ratingController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const ratingRouter = express.Router();

ratingRouter
  .route('/')
  .get(ratingListGet)
  .post(
    authenticate,
    body('rating_value').notEmpty().isInt({min: 1, max: 5}).toInt(),
    body('media_id').notEmpty().isInt({min: 1}).toInt(),
    validationErrors,
    ratingPost,
  );

ratingRouter
  .route('/bymedia/:id')
  .get(
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    ratingListByMediaIdGet,
  );

ratingRouter.route('/byuser').get(authenticate, ratingListByUserGet);

ratingRouter
  .route('/average/:id')
  .get(
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    ratingAverageByMediaIdGet,
  );

ratingRouter
  .route('/:id')
  .delete(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    ratingDelete,
  );

export default ratingRouter;
