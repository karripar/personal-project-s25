import express from 'express';
import {
  likeListGet,
  likeListByMediaIdGet,
  likeListByUserIdGet,
  likePost,
  likeDelete,
  likeCountByMediaIdGet,
  likeByMediaIdAndUserIdGet,
} from '../controllers/likeController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const likeRouter = express.Router();

/**
 * @apiDefine likeGroup Like API
 * All the APIs related to likes
 */

likeRouter
  .route('/')
  .get(
    /**
     * @api {get} /likes Get Likes
     * @apiName GetLikes
     * @apiGroup likeGroup
     * @apiVersion 1.0.0
     * @apiDescription Get all likes
     * @apiPermission none
     *
     * @apiSuccess {object[]} likes List of likes
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "like_id": 1,
     *    "media_id": 1,
     *    "user_id": 1,
     *    "createdAt": "2021-07-01T00:00:00.000Z",
     *    "updatedAt": "2021-07-01T00:00:00.000Z"
     *  }
     * ]
     *
     * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
     */
    likeListGet)
  .post(
    /**
     * @api {post} /likes Create Like
     * @apiName CreateLike
     * @apiGroup likeGroup
     * @apiVersion 1.0.0
     * @apiDescription Create a like
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} media_id Media ID
     *
     * @apiSuccess {Number} like_id Like ID
     * @apiSuccess {Number} media_id Media ID
     * @apiSuccess {Number} user_id User ID
     * @apiSuccess {Date} createdAt Date of creation
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "like_id": 1,
     *  "media_id": 1,
     *  "user_id": 1,
     *  "createdAt": "2021-07-01T00:00:00.000Z"
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
    body('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    likePost,
  );

likeRouter
  .route('/bymedia/:media_id')
  .get(
    /**
     * @api {get} /likes/bymedia/:media_id Get Likes by Media
     * @apiName GetLikesByMedia
     * @apiGroup likeGroup
     * @apiVersion 1.0.0
     * @apiDescription Get likes by media
     * @apiPermission none
     *
     * @apiParam {Number} media_id Media ID
     *
     * @apiSuccess {object[]} likes List of likes
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "like_id": 1,
     *    "media_id": 1,
     *    "user_id": 1,
     *    "createdAt": "2021-07-01T00:00:00.000Z"
     * }
     * ]
     *
     * @apiError (Error 400) {String} BadRequest Invalid request
     * @apiErrorExample {json} BadRequest
     *    HTTP/1.1 400 Bad Request
     *    {
     *      "error": "Invalid request"
     *    }
     */
    param('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    likeListByMediaIdGet,
  );

likeRouter
  .route('/bymedia/user/:media_id')
  .get(
    /**
     * @api {get} /likes/bymedia/user/:media_id Get Like by Media and User
     * @apiName GetLikeByMediaAndUser
     * @apiGroup likeGroup
     * @apiVersion 1.0.0
     * @apiDescription Get like by media and user
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} media_id Media ID
     *
     * @apiSuccess {Number} like_id Like ID
     * @apiSuccess {Number} media_id Media ID
     * @apiSuccess {Number} user_id User ID
     * @apiSuccess {Date} createdAt Date of creation
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "like_id": 1,
     *  "media_id": 1,
     *  "user_id": 1,
     *  "createdAt": "2021-07-01T00:00:00.000Z"
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
    param('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    likeByMediaIdAndUserIdGet,
  );

likeRouter
  .route('/byuser/:id')
  .get(
    /**
     * @api {get} /likes/byuser/:id Get Likes by User
     * @apiName GetLikesByUser
     * @apiGroup likeGroup
     * @apiVersion 1.0.0
     * @apiDescription Get likes by user
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} id User ID
     *
     * @apiSuccess {object[]} likes List of likes
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "like_id": 1,
     *    "media_id": 1,
     *    "user_id": 1,
     *    "createdAt": "2021-07-01T00:00:00.000Z"
     * }
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
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    likeListByUserIdGet,
  );

likeRouter
  .route('/count/:id')
  .get(
    /**
     * @api {get} /likes/count/:id Get Like Count by Media
     * @apiName GetLikeCountByMedia
     * @apiGroup likeGroup
     * @apiVersion 1.0.0
     * @apiDescription Get like count by media
     * @apiPermission none
     *
     * @apiParam {Number} id Media ID
     *
     * @apiSuccess {Number} count Like count
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "count": 1
     * }
     *
     * @apiError (Error 400) {String} BadRequest Invalid request
     * @apiErrorExample {json} BadRequest
     *    HTTP/1.1 400 Bad Request
     *    {
     *      "error": "Invalid request"
     *    }
     */
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    likeCountByMediaIdGet,
  );

likeRouter
  .route('/:id')
  .delete(
    /**
     * @api {delete} /likes/:id Delete Like
     * @apiName DeleteLike
     * @apiGroup likeGroup
     * @apiVersion 1.0.0
     * @apiDescription Delete a like
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} id Like ID
     *
     * @apiSuccess {String} message Success message
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "message": "Like deleted successfully"
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
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    likeDelete,
  );

export default likeRouter;
