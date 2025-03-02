import express from 'express';
import {authenticate, validationErrors} from '../../middlewares';
import { getMediaRatings, getLatestMedias, getLatestNotifications, getMediaComments, getUserActivity, getUserNotifications } from '../controllers/analyticsController';


const analyticsRouter = express.Router();

/**
 * @apiDefine analyticsGroup Analytics API
 * All the APIs related to analytics
 */

analyticsRouter
  .route(
    /**
     * @api {get} /activity Get User Activity
     * @apiName GetUserActivity
     * @apiGroup analyticsGroup
     * @apiVersion 1.0.0
     * @apiDescription Get user activity
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiSuccess {object} activity User activity
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "activity": {
     *    "likes": 10,
     *    "comments": 5,
     *    "follows": 2
     *  }
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
    '/activity')
  .get(authenticate, getUserActivity);


analyticsRouter
  .route(
    /**
     * @api {get} /notifications Get User Notifications
     * @apiName GetUserNotifications
     * @apiGroup analyticsGroup
     * @apiVersion 1.0.0
     * @apiDescription Get user notifications
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiSuccess {object[]} notifications User notifications
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "id": 1,
     *    "message": "You have a new follower",
     *    "createdAt": "2021-01-01T00:00:00.000Z"
     *  }
     * ]
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
    '/notifications')
  .get(authenticate, getUserNotifications);


analyticsRouter
  .route(
    /**
     * @api {get} /latestnotifications Get Latest Notifications
     * @apiName GetLatestNotifications
     * @apiGroup analyticsGroup
     * @apiVersion 1.0.0
     * @apiDescription Get latest notifications
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiSuccess {object[]} notifications Latest notifications
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "id": 1,
     *    "message": "You have a new follower",
     *    "createdAt": "2021-01-01T00:00:00.000Z"
     *  }
     * ]
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
    '/latestnotifications')
  .get(authenticate, getLatestNotifications);


analyticsRouter
  .route(
    /**
     * @api {get} /latestMedias Get Latest Medias
     * @apiName GetLatestMedias
     * @apiGroup analyticsGroup
     * @apiVersion 1.0.0
     * @apiDescription Get latest medias
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiSuccess {object[]} medias Latest medias
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "id": 1,
     *    "title": "Media title",
     *    "createdAt": "2021-01-01T00:00:00.000Z"
     *  }
     * ]
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
    '/latestMedias')
  .get(authenticate, getLatestMedias);


analyticsRouter
  .route(
    /**
     * @api {get} /Mediaratings Get Media Ratings
     * @apiName GetMediaRatings
     * @apiGroup analyticsGroup
     * @apiVersion 1.0.0
     * @apiDescription Get media ratings
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiSuccess {object[]} ratings Media ratings
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "id": 1,
     *    "rating": 5,
     *    "createdAt": "2021-01-01T00:00:00.000Z"
     *  }
     * ]
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
    '/Mediaratings')
  .get(
    authenticate,
    validationErrors,
    getMediaRatings,
  );


analyticsRouter
  .route(
    /**
     * @api {get} /Mediacomments Get Media Comments
     * @apiName GetMediaComments
     * @apiGroup analyticsGroup
     * @apiVersion 1.0.0
     * @apiDescription Get media comments
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiSuccess {object[]} comments Media comments
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "id": 1,
     *    "comment": "Media comment",
     *    "createdAt": "2021-01-01T00:00:00.000Z"
     *  }
     * ]
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
    '/Mediacomments')
  .get(
    authenticate,
    validationErrors,
    getMediaComments,
  );


export default analyticsRouter;
