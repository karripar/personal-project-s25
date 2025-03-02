import express from 'express';
import {
  tagListGet,
  tagListByMediaIdGet,
  tagPost,
  tagDelete,
  tagFilesByTagGet,
  tagDeleteFromMedia
} from '../controllers/tagController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const tagRouter = express.Router();

/**
 * @apiDefine tagGroup Tag API
 * All the APIs related to tags
 */

tagRouter
  .route('/')
  .get(
    /**
     * @api {get} /tags Get Tags
     * @apiName GetTags
     * @apiGroup tagGroup
     * @apiVersion 1.0.0
     * @apiDescription Get all tags
     * @apiPermission none
     *
     * @apiSuccess {object[]} tags List of tags
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "tag_id": 1,
     *    "tag_name": "tag1",
     *    "media_id": 1,
     *    "createdAt": "2021-07-01T00:00:00.000Z"
     *  }
     * ]
     *
     * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
     */
    tagListGet)
  .post(
    /**
     * @api {post} /tags Create Tag
     * @apiName CreateTag
     * @apiGroup tagGroup
     * @apiVersion 1.0.0
     * @apiDescription Create a tag
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {String[]} tags Tags
     * @apiParam {Number} media_id Media ID
     *
     * @apiSuccess {Number} tag_id Tag ID
     * @apiSuccess {String} tag_name Tag Name
     * @apiSuccess {Number} media_id Media ID
     * @apiSuccess {Date} createdAt Date of creation
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "tag_id": 1,
     *  "tag_name": "tag1",
     *  "media_id": 1,
     *  "createdAt": "2021-07-01T00:00:00.000Z"
     * }
     */
    authenticate,
    body('tags')
      .isArray({min: 1})
      .withMessage('Tags must be an array with at least one tag')
      .custom((value: string[]) => {
        if (value.some((tag) => tag.length > 50)) {
          throw new Error('Tag names must be less than 50 characters');
        }
        return true;
      }),
    body('media_id').isInt({min: 1}).toInt(),
    validationErrors,
    tagPost,
  );

tagRouter
  .route('/bymedia/:id')
  .get(
    /**
     * @api {get} /tags/bymedia/:id Get Tags by Media ID
     * @apiName GetTagsByMediaId
     * @apiGroup tagGroup
     * @apiVersion 1.0.0
     * @apiDescription Get tags by media ID
     * @apiPermission none
     *
     * @apiParam {Number} id Media ID
     *
     * @apiSuccess {object[]} tags List of tags
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "tag_id": 1,
     *    "tag_name": "tag1",
     *    "media_id": 1,
     *    "createdAt": "2021-07-01T00:00:00.000Z"
     *  }
     * ]
     */
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    tagListByMediaIdGet,
  );

tagRouter
  .route('/bymedia/:Media/:tag_id')
  .delete(
    /**
     * @api {delete} /tags/bymedia/:media_id/:tag_id Delete Tag from Media
     * @apiName DeleteTagFromMedia
     * @apiGroup tagGroup
     * @apiVersion 1.0.0
     * @apiDescription Delete a tag from media
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} media_id Media ID
     * @apiParam {Number} tag_id Tag ID
     *
     * @apiSuccess {String} message Success message
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "message": "Tag deleted from media"
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
    param('tag_id').isInt({min: 1}).toInt(),
    validationErrors,
    tagDeleteFromMedia,
  );

tagRouter
  .route('/bytag/:tag_id')
  .get(
    /**
     * @api {get} /tags/bytag/:tag_id Get Tag Files
     * @apiName GetTagFiles
     * @apiGroup tagGroup
     * @apiVersion 1.0.0
     * @apiDescription Get files by tag
     * @apiPermission none
     *
     * @apiParam {Number} tag_id Tag ID
     *
     * @apiSuccess {object[]} files List of files
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * [
     *  {
     *    "media_id": 1,
     *    "title": "title1",
     *    "description": "description1",
     *    "filename": "filename1",
     *    "filetype": "filetype1",
     *    "filesize": 1,
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
     */
    param('tag_id').isInt({min: 1}).toInt(),
    validationErrors,
    tagFilesByTagGet,
  );

tagRouter
  .route('/:id')
  .delete(
    /**
     * @api {delete} /tags/:id Delete Tag
     * @apiName DeleteTag
     * @apiGroup tagGroup
     * @apiVersion 1.0.0
     * @apiDescription Delete a tag
     * @apiPermission token
     *
     * @apiUse token
     * @apiUse unauthorized
     *
     * @apiParam {Number} id Tag ID
     *
     * @apiSuccess {String} message Success message
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "message": "Tag deleted"
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
    tagDelete,
  );

export default tagRouter;
