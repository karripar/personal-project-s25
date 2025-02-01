import express from 'express';
import {
  materialListGet,
  materialGet,
  materialPost,
  materialPut,
  materialDelete,
  materialByUserGet,
  materialListMostLikedGet,
} from '../controllers/materialController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param, query} from 'express-validator';

const materialRouter = express.Router();

materialRouter
  .route('/')
  .get(
    query('page').optional().isInt({min: 1}).toInt(),
    query('limit').optional().isInt({min: 1}).toInt(),
    validationErrors,
    materialListGet,
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
    materialPost,
  );

materialRouter.route('/mostliked').get(materialListMostLikedGet);

materialRouter
  .route('/:id')
  .get(param('id').isInt({min: 1}).toInt(), validationErrors, materialGet)
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
    materialPut,
  )
  .delete(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    materialDelete,
  );

materialRouter.route('/byuser/:id').get(materialByUserGet);

materialRouter.route('/bytoken').get(authenticate, materialByUserGet);

export default materialRouter;
