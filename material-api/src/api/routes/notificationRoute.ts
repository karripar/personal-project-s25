import express from 'express';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';
import { notificationListGet, notificationDelete, notificationMarkAsRead, notificationPost } from '../controllers/notificationController';

const notificationRouter = express.Router();

notificationRouter
  .route('/')
  .get(authenticate, notificationListGet);

notificationRouter
  .route('/:notification_id')
  .delete(
    authenticate,
    param('notification_id').isInt({min: 1}).toInt(),
    validationErrors,
    notificationDelete,
  );

notificationRouter
  .route('/:notification_id/read')
  .put(
    authenticate,
    param('notification_id').isInt({min: 1}).toInt(),
    validationErrors,
    notificationMarkAsRead,
  );


notificationRouter
  .route('/post')
  .post(
    authenticate,
    body('notification_text').isString().notEmpty(),
    body('notification_type_id').isInt({min: 1}).toInt(),
    validationErrors,
    notificationPost,
  );



export default notificationRouter;

