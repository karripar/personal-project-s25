import express from 'express';
import {authenticate, validationErrors} from '../../middlewares';
import { getMaterialRatings, getLatestMaterials, getLatestNotifications, getMaterialComments, getUserActivity, getUserNotifications } from '../controllers/analyticsController';


const analyticsRouter = express.Router();

analyticsRouter
  .route('/activity')
  .get(authenticate, getUserActivity);


analyticsRouter
  .route('/notifications')
  .get(authenticate, getUserNotifications);


analyticsRouter
  .route('/latestnotifications')
  .get(authenticate, getLatestNotifications);


analyticsRouter
  .route('/latestmaterials')
  .get(authenticate, getLatestMaterials);


analyticsRouter
  .route('/materialratings')
  .get(
    authenticate,
    validationErrors,
    getMaterialRatings,
  );


analyticsRouter
  .route('/materialcomments')
  .get(
    authenticate,
    validationErrors,
    getMaterialComments,
  );


export default analyticsRouter;
