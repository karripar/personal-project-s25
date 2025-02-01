import express from 'express';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';
import {
  getFollowersByUserId,
  getFollowedUsersByUserId,
  postFollow,
  deleteFollow,
} from '../controllers/followController';

const followRouter = express.Router();

followRouter
  .route('/')
  .post(
    authenticate,
    body('followed_user_id').isInt({min: 1}).toInt(),
    validationErrors,
    postFollow,
  );

followRouter
  .route('/byuser/:user_id')
  .get(
    param('user_id').isInt({min: 1}).toInt(),
    validationErrors,
    getFollowedUsersByUserId,
  );

followRouter
  .route('/byuser/followers/:user_id')
  .get(
    param('user_id').isInt({min: 1}).toInt(),
    validationErrors,
    getFollowersByUserId,
  );

followRouter
  .route('/:user_id')
  .delete(
    authenticate,
    param('user_id').isInt({min: 1}).toInt(),
    validationErrors,
    deleteFollow,
  );

export default followRouter;
