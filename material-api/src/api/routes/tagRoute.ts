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

tagRouter
  .route('/')
  .get(tagListGet)
  .post(
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
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    tagListByMediaIdGet,
  );

tagRouter
  .route('/bymedia/:Media/:tag_id')
  .delete(
    authenticate,
    param('media_id').isInt({min: 1}).toInt(),
    param('tag_id').isInt({min: 1}).toInt(),
    validationErrors,
    tagDeleteFromMedia,
  );

tagRouter
  .route('/bytag/:tag_id')
  .get(
    param('tag_id').isInt({min: 1}).toInt(),
    validationErrors,
    tagFilesByTagGet,
  );

tagRouter
  .route('/:id')
  .delete(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    tagDelete,
  );

export default tagRouter;
