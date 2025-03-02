import express from 'express';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';
import { notificationListGet, notificationDelete, notificationMarkAsRead, notificationPost } from '../controllers/notificationController';

const notificationRouter = express.Router();

/**
 * @apiDefine notificationGroup Notification API
 * All the APIs related to notifications
 */

notificationRouter
  .route('/')
  .get(
    /**
     * @api {get} /notifications Get Notifications
     * @apiName GetNotifications
     * @apiGroup notificationGroup
     * @apiVersion 1.0.0
     * @apiDescription Get all notifications
     * @apiPermission token
     *
     * @apiUse token
     *
     * @apiSuccess {object[]} notifications List of notifications
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "notification_id": 1,
     *    "notification_text": "This is a notification",
     *    "notification_type_id": 1,
     *    "user_id": 1,
     *    "is_archived": false,
     *    "is_read": false,
     *    "createdAt": "2021-07-01T00:00:00.000Z"
     *  }
     * ]
     *
     * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
     */
    authenticate, notificationListGet);

notificationRouter
  .route('/:notification_id')
  .delete(
    /**
     * @api {delete} /notifications/:notification_id Delete Notification
     * @apiName DeleteNotification
     * @apiGroup notificationGroup
     * @apiVersion 1.0.0
     * @apiDescription Delete a notification
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} notification_id Notification ID
     *
     * @apiSuccess {String} message Success message
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "message": "Notification deleted"
     * }
     *
     * @apiError (Error 400) {String} BadRequest Invalid request
     * @apiErrorExample {json} BadRequest
     *    HTTP/1.1 400 Bad Request
     *    {
     *      "error": "Invalid request"
     *    }
     *
     * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
     */
    authenticate,
    param('notification_id').isInt({min: 1}).toInt(),
    validationErrors,
    notificationDelete,
  );

notificationRouter
  .route('/:notification_id/read')
  .put(
    /**
     * @api {put} /notifications/:notification_id/read Mark Notification as Read
     * @apiName MarkNotificationAsRead
     * @apiGroup notificationGroup
     * @apiVersion 1.0.0
     * @apiDescription Mark a notification as read
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} notification_id Notification ID
     *
     * @apiSuccess {String} message Success message
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "message": "Notification marked as read"
     * }
     *
     * @apiError (Error 400) {String} BadRequest Invalid request
     * @apiErrorExample {json} BadRequest
     *    HTTP/1.1 400 Bad Request
     *    {
     *      "error": "Invalid request"
     *    }
     *
     * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
     */
    authenticate,
    param('notification_id').isInt({min: 1}).toInt(),
    validationErrors,
    notificationMarkAsRead,
  );


notificationRouter
  .route('/post')
  .post(
    /**
     * @api {post} /notifications/post Post Notification
     * @apiName PostNotification
     * @apiGroup notificationGroup
     * @apiVersion 1.0.0
     * @apiDescription Post a notification
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {String} notification_text Notification text
     * @apiParam {Number} notification_type_id Notification type ID
     *
     * @apiSuccess {String} message Success message
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "message": "Notification posted"
     * }
     *
     * @apiError (Error 400) {String} BadRequest Invalid request
     * @apiErrorExample {json} BadRequest
     *    HTTP/1.1 400 Bad Request
     *    {
     *      "error": "Invalid request"
     *    }
     *
     * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
     */
    authenticate,
    body('notification_text').isString().notEmpty(),
    body('notification_type_id').isInt({min: 1}).toInt(),
    validationErrors,
    notificationPost,
  );



export default notificationRouter;

