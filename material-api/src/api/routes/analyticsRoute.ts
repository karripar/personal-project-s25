import express from 'express';
import {authenticate, validationErrors} from '../../middlewares';
import {
  getMediaRatings,
  getLatestMedias,
  getLatestNotifications,
  getMediaComments,
  getUserActivity,
  getUserNotifications,
} from '../controllers/analyticsController';

const analyticsRouter = express.Router();


analyticsRouter
  .route(
    '/activity',
  )
  .get(authenticate, getUserActivity);

analyticsRouter
  .route(
    '/notifications',
  )
  .get(authenticate, getUserNotifications);

analyticsRouter
  .route('/latestnotifications')
  .get(authenticate, getLatestNotifications);

analyticsRouter.route('/latestMedias').get(
  authenticate, getLatestMedias);

analyticsRouter
  .route('/Mediaratings')
  .get(authenticate, validationErrors, getMediaRatings);

analyticsRouter
  .route('/Mediacomments')
  .get(authenticate, validationErrors, getMediaComments);

export default analyticsRouter;
