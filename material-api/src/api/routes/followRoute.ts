import express from 'express';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';
import {
  getFollowersByUserId,
  getFollowedUsersByUserId,
  getFollowedUsersByToken,
  getFollowersByToken,
  postFollow,
  deleteFollow,
} from '../controllers/followController';

const followRouter = express.Router();

followRouter
  .route('/')
  .post(
    authenticate,
    body('user_id').isInt({min: 1}).toInt(),
    validationErrors,
    postFollow,
  );

followRouter
  .route('/byuser/followed/:user_id')
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
  .route('/bytoken/followed')
  .get(authenticate, getFollowedUsersByToken);

followRouter.route('/bytoken/followers').get(authenticate, getFollowersByToken);

followRouter
  .route('/:follow_id')
  .delete(
    authenticate,
    param('follow_id').isInt({min: 1}).toInt(),
    validationErrors,
    deleteFollow,
  );

export default followRouter;
