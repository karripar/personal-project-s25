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
} from '../controllers/mediaController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param, query} from 'express-validator';

const mediaRouter = express.Router();

mediaRouter
  .route('/')
  .get(
    query('page').optional().isInt({min: 1}).toInt(),
    query('limit').optional().isInt({min: 1}).toInt(),
    validationErrors,
    mediaListGet,
  )
  .post(
    authenticate,
    body('title')
      .trim()
      .notEmpty()
      .isString()
      .isLength({min: 3, max: 128})
      .escape(),
    body('description')
      .trim()
      .notEmpty()
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

mediaRouter.route('/mostliked').get(mediaListMostLikedGet);

mediaRouter
  .route('/search')
  .get(
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

mediaRouter
  .route('/followed')
  .get(authenticate, validationErrors, mediaListFollowedGet);

mediaRouter
  .route('/byid/:id')
  .get(param('id').isInt({min: 1}).toInt(), validationErrors, mediaGet)
  .put(
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
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    mediaDelete,
  );

mediaRouter.route('/byuser/:user_id').get(mediaByUserGet);

mediaRouter.route('/bytoken').get(authenticate, mediaByTokenGet);

export default mediaRouter;
