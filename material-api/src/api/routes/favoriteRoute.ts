import express from 'express';
import { favoriteListGet, favoriteListGetByUserId, favoriteAdd, favoriteRemove, favoriteCountGet} from '../controllers/favoriteController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const favoriteRouter = express.Router();

/**
 * @apiDefine favoriteGroup Favorite API
 * All the APIs related to favorites
 */

favoriteRouter
  .route('/')
  .get(
    /**
     * @api {get} /favorites Get Favorites
     * @apiName GetFavorites
     * @apiGroup favoriteGroup
     * @apiVersion 1.0.0
     * @apiDescription Get all favorites
     * @apiPermission token
     *
     * @apiUse token
     *
     * @apiSuccess {object[]} favorites List of favorites
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "media_id": 1,
     *    "user_id": 1,
     *    "createdAt": "2021-07-01T00:00:00.000Z"
     *  }
     * ]
     *
     * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
     */
    authenticate, favoriteListGet)
  .post(
    /**
     * @api {post} /favorites Add Favorite
     * @apiName AddFavorite
     * @apiGroup favoriteGroup
     * @apiVersion 1.0.0
     * @apiDescription Add a favorite
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} media_id Media ID
     *
     * @apiSuccess {Number} media_id Media ID
     * @apiSuccess {Number} user_id User ID
     * @apiSuccess {Date} createdAt Date of creation
     * 
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
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
    body('media_id').notEmpty().isInt({min: 1}).toInt(),
    validationErrors,
    favoriteAdd,
);

favoriteRouter
  .route('/byuser/:user_id')
  .get(
    /**
     * @api {get} /favorites/byuser/:user_id Get Favorites by User
     * @apiName GetFavoritesByUser
     * @apiGroup favoriteGroup
     * @apiVersion 1.0.0
     * @apiDescription Get favorites by user
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} user_id User ID
     *
     * @apiSuccess {object[]} favorites List of favorites
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "media_id": 1,
     *    "user_id": 1,
     *    "createdAt": "2021-07-01T00:00:00.000Z"
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
    param('user_id').isInt({min: 1}).toInt(),
    validationErrors,
    favoriteListGetByUserId,
  );

favoriteRouter
  .route('/:media_id')
  .get(
    /**
     * @api {get} /favorites/:media_id Get Favorite Count
     * @apiName GetFavoriteCount
     * @apiGroup favoriteGroup
     * @apiVersion 1.0.0
     * @apiDescription Get favorite count
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} media_id Media ID
     *
     * @apiSuccess {Number} count Favorite count
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
     *
     * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
     */
    param('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    favoriteCountGet,
  )
  .delete(
    /**
     * @api {delete} /favorites/:media_id Remove Favorite
     * @apiName RemoveFavorite
     * @apiGroup favoriteGroup
     * @apiVersion 1.0.0
     * @apiDescription Remove a favorite
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} media_id Media ID
     *
     * @apiSuccess {Number} media_id Media ID
     * @apiSuccess {Number} user_id User ID
     * @apiSuccess {Date} createdAt Date of creation
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
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
    favoriteRemove,
  );

export { favoriteRouter };


