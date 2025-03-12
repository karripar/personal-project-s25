import express from 'express';
import {
  mediaListGet,
  mediaListMostLikedGet,
  mediaListFollowedGet,
  mediaPost,
  mediaGet,
  mediaPut,
  mediaDelete,
  mediaByUserGet,
  mediaWithSearchGet,
  mediaByTokenGet,
  mediaByUsernameGet,
  mediaByTagnameGet,
} from '../controllers/mediaController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param, query} from 'express-validator';

const mediaRouter = express.Router();

/**
 * @apiDefine mediaGroup Media
 * All the APIs related to media
 */

/**
 * @apiDefine token Authentication required in the form of a token
 * token should be passed in the header as 'Authorization':
 * 'Bearer <token>'
 * @apiHeader {String} Authorization Bearer <token>
 */

/**
 * @apiDefine unauthorized Unauthorized
 * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
 * @apiErrorExample {json} Unauthorized
 *   HTTP/1.1 401 Unauthorized
 *  {
 *   "error": "Unauthorized"
 * }
 */


mediaRouter
  .route('/')
  .get(
    /**
     * @api {get} /media Get Media
     * @apiName GetMedia
     * @apiGroup mediaGroup
     * @apiVersion 1.0.0
     * @apiDescription Get all media
     * @apiPermission none
     *
     * @apiSuccess {object[]} media List of media
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "media_id": 1,
     *    "title": "Media Title",
     *    "description": "Media Description",
     *    "filename": "media.jpg",
     *    "media_type": "image/jpeg",
     *    "filesize": 1024,
     *    "user_id": 1,
     *    "createdAt": "2021-07-01T00:00:00.000Z"
     * }
     * ]
     *
     * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
     */
    query('page').optional().isInt({min: 1}).toInt(),
    query('limit').optional().isInt({min: 1}).toInt(),
    validationErrors,
    mediaListGet,
  )
  .post(
    /**
     * @api {post} /media Create Media
     * @apiName CreateMedia
     * @apiGroup mediaGroup
     * @apiVersion 1.0.0
     * @apiDescription Create a media
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiBody {String} title Media title
     * @apiBody {String} description Media description
     * @apiBody {String} filename Media filename
     * @apiBody {String} media_type Media type
     * @apiBody {Number} filesize Media filesize
     *
     * @apiSuccess {Number} media_id Media ID
     * @apiSuccess {String} title Media title
     * @apiSuccess {String} description Media description
     * @apiSuccess {String} filename Media filename from the upload response
     * @apiSuccess {String} media_type Media type
     * @apiSuccess {Number} filesize Media filesize
     * @apiSuccess {Number} user_id User ID
     * @apiSuccess {Date} createdAt Date of creation
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "media_id": 1,
     *  "title": "Media Title",
     *  "description": "Media Description",
     *  "filename": "media.jpg",
     *  "media_type": "image/jpeg",
     *  "filesize": 1024,
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
    body('title')
      .trim()
      .notEmpty()
      .isString()
      .isLength({min: 3, max: 128})
      .escape(),
    body('description')
      .trim()
      .optional()
      .isString()
      .isLength({max: 1000})
      .escape(),
    body('filename')
      .trim()
      .notEmpty()
      .isString()
      .matches(/^[\w.-]+$/)
      .escape(),
    body('media_type').trim().notEmpty().isMimeType(),
    body('filesize').notEmpty().isInt({min: 1}).toInt(),
    validationErrors,
    mediaPost,
  );

mediaRouter.route('/mostliked').get(
  /**
   * @api {get} /media/mostliked Get Most Liked Media
   * @apiName GetMostLikedMedia
   * @apiGroup mediaGroup
   * @apiVersion 1.0.0
   * @apiDescription Get most liked media
   * @apiPermission none
   *
   * @apiSuccess {object[]} media List of media
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "media_id": 1,
   *    "title": "Media Title",
   *    "description": "Media Description",
   *    "filename": "media.jpg",
   *    "media_type": "image/jpeg",
   *    "filesize": 1024,
   *    "user_id": 1,
   *    "createdAt": "2021-07-01T00:00:00.000Z"
   * }
   * ]
   *
   * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
   */
  mediaListMostLikedGet,
);

mediaRouter.route('/search').get(
  /**
   * @api {get} /media/search Search Media
   * @apiName SearchMedia
   * @apiGroup mediaGroup
   * @apiVersion 1.0.0
   * @apiDescription Search media
   * @apiPermission none
   *
   * @apiParam {String} [search] Search string to search by title, description, or tags
   * @apiParam {String} [searchBy=title] Search by field
   * @apiParam {Number} [page=1] Page number
   * @apiParam {Number} [limit=10] Number of items per page
   *
   * @apiSuccess {object[]} media List of media
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "media_id": 1,
   *    "title": "Media Title",
   *    "description": "Media Description",
   *    "filename": "media.jpg",
   *    "media_type": "image/jpeg",
   *    "filesize": 1024,
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
  query('search').optional().isString().trim().escape(),
  query('searchBy')
    .optional()
    .isIn(['title', 'description', 'tags'])
    .withMessage('Invalid searchBy value'),
  query('page').optional().isInt({min: 1}).toInt(),
  query('limit').optional().isInt({min: 1}).toInt(),
  validationErrors,
  mediaWithSearchGet,
);

mediaRouter.route('/followed').get(
  /**
   * @api {get} /media/followed Get Media from Followed Users
   * @apiName GetFollowedMedia
   * @apiGroup mediaGroup
   * @apiVersion 1.0.0
   * @apiDescription Get media followed by user
   * @apiPermission token
   *
   * @apiUse token
   * @apiUse unauthorized
   *
   * @apiSuccess {object[]} media List of media
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "media_id": 1,
   *    "title": "Media Title",
   *    "description": "Media Description",
   *    "filename": "media.jpg",
   *    "media_type": "image/jpeg",
   *    "filesize": 1024,
   *    "user_id": 1,
   *    "createdAt": "2021-07-01T00:00:00.000Z"
   * }
   * ]
   *
   * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
   * @apiErrorExample {json} Unauthorized
   *   HTTP/1.1 401 Unauthorized
   *  {
   *   "error": "Unauthorized"
   * }
   */
  authenticate,
  validationErrors,
  mediaListFollowedGet,
);

mediaRouter.route('/bytagname/:tagname').get(
  /**
   * @api {get} /media/bytagname/:tagname Get Media by Tagname
   * @apiName GetMediaByTagname
   * @apiGroup mediaGroup
   * @apiVersion 1.0.0
   * @apiDescription Get media by tagname
   * @apiPermission none
   *
   * @apiParam {String} tagname Tagname
   *
   * @apiSuccess {object[]} media List of media
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "media_id": 1,
   *    "title": "Media Title",
   *    "description": "Media Description",
   *    "filename": "media.jpg",
   *    "media_type": "image/jpeg",
   *    "filesize": 1024,
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
  param('tagname').trim().isString().isLength({min: 1, max: 50}).escape(),
  mediaByTagnameGet,
);

mediaRouter
  .route('/byid/:id')
  .get(
    /**
     * @api {get} /media/byid/:id Get Media by ID
     * @apiName GetMediaById
     * @apiGroup mediaGroup
     * @apiVersion 1.0.0
     * @apiDescription Get media by ID
     * @apiPermission none
     *
     * @apiSuccess {Number} media_id Media ID
     * @apiSuccess {String} title Media title
     * @apiSuccess {String} description Media description
     * @apiSuccess {String} filename Media filename
     * @apiSuccess {String} media_type Media type
     * @apiSuccess {Number} filesize Media filesize
     * @apiSuccess {Number} user_id User ID
     * @apiSuccess {Date} createdAt Date of creation
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "media_id": 1,
     *  "title": "Media Title",
     *  "description": "Media Description",
     *  "filename": "media.jpg",
     *  "media_type": "image/jpeg",
     *  "filesize": 1024,
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
     */
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    mediaGet,
  )
  .put(
    /**
     * @api {put} /media/byid/:id Update Media
     * @apiName UpdateMedia
     * @apiGroup mediaGroup
     * @apiVersion 1.0.0
     * @apiDescription Update a media
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} id Media ID
     *
     * @apiBody {String} [title] Media title
     * @apiBody {String} [description] Media description
     *
     * @apiSuccess {Number} media_id Media ID
     * @apiSuccess {String} title Media title
     * @apiSuccess {String} description Media description
     * @apiSuccess {String} filename Media filename
     * @apiSuccess {String} media_type Media type
     * @apiSuccess {Number} filesize Media filesize
     * @apiSuccess {Number} user_id User ID
     * @apiSuccess {Date} createdAt Date of creation
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "media_id": 1,
     *  "title": "Media Title",
     *  "description": "Media Description",
     *  "filename": "media.jpg",
     *  "media_type": "image/jpeg",
     *  "filesize": 1024,
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
     * @apiErrorExample {json} Unauthorized
   *   HTTP/1.1 401 Unauthorized
   *  {
   *   "error": "Unauthorized"
   * }
     */
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    body('title')
      .optional()
      .trim()
      .isString()
      .isLength({min: 3, max: 128})
      .escape(),
    body('description')
      .optional()
      .trim()
      .isString()
      .isLength({max: 1000})
      .escape(),
    validationErrors,
    mediaPut,
  )
  .delete(
    /**
     * @api {delete} /media/byid/:id Delete Media
     * @apiName DeleteMedia
     * @apiGroup mediaGroup
     * @apiVersion 1.0.0
     * @apiDescription Delete a media
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} id Media ID
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
     * @apiErrorExample {json} Unauthorized
   *   HTTP/1.1 401 Unauthorized
   *  {
   *   "error": "Unauthorized"
   * }
     */
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    mediaDelete,
  );

mediaRouter.route('/byusername/:username').get(
  /**
   * @api {get} /media/byusername/:username Get Media by Username
   * @apiName GetMediaByUsername
   * @apiGroup mediaGroup
   * @apiVersion 1.0.0
   * @apiDescription Get media by username
   * @apiPermission none
   *
   * @apiParam {String} username Username
   *
   * @apiSuccess {object[]} media List of media
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "media_id": 1,
   *    "title": "Media Title",
   *    "description": "Media Description",
   *    "filename": "media.jpg",
   *    "media_type": "image/jpeg",
   *    "filesize": 1024,
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
  param('username')
    .trim()
    .isString()
    .isLength({min: 3, max: 50})
    .withMessage('Invalid username format'),
  mediaByUsernameGet,
);

mediaRouter.route('/byuser/:user_id').get(
  /**
   * @api {get} /media/byuser/:user_id Get Media by User ID
   * @apiName GetMediaByUser
   * @apiGroup mediaGroup
   * @apiVersion 1.0.0
   * @apiDescription Get media by user
   * @apiPermission none
   *
   * @apiParam {Number} user_id User ID
   *
   * @apiSuccess {object[]} media List of media
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "media_id": 1,
   *    "title": "Media Title",
   *    "description": "Media Description",
   *    "filename": "media.jpg",
   *    "media_type": "image/jpeg",
   *    "filesize": 1024,
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
  param('user_id').isInt({min: 1}).toInt(),
  validationErrors,
  mediaByUserGet,
);

mediaRouter.route('/bytoken').get(
  /**
   * @api {get} /media/bytoken Get Media by Token
   * @apiName GetMediaByToken
   * @apiGroup mediaGroup
   * @apiVersion 1.0.0
   * @apiDescription Get media by token
   * @apiPermission token
   *
   * @apiUse token
   * @apiUse unauthorized
   *
   * @apiSuccess {object[]} media List of media
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "media_id": 1,
   *    "title": "Media Title",
   *    "description": "Media Description",
   *    "filename": "media.jpg",
   *    "media_type": "image/jpeg",
   *    "filesize": 1024,
   *    "user_id": 1,
   *    "createdAt": "2021-07-01T00:00:00.000Z"
   * }
   * ]
   *
   * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
   * @apiErrorExample {json} Unauthorized
   *   HTTP/1.1 401 Unauthorized
   *  {
   *   "error": "Unauthorized"
   * }
   */
  authenticate,
  mediaByTokenGet,
);

export default mediaRouter;
