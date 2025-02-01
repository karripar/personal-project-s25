import express from 'express';
import {
  tagListGet,
  tagListByMaterialIdGet,
  tagPost,
  tagDelete,
  tagFilesByTagGet,
  tagDeleteFromMaterial
} from '../controllers/tagController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(tagListGet)
  .post(
    authenticate,
    body('tag_name')
      .trim()
      .notEmpty()
      .isString()
      .isLength({min: 2, max: 50})
      .escape(),
    body('material_id').isInt({min: 1}).toInt(),
    validationErrors,
    tagPost,
  );

router
  .route('/bymedia/:id')
  .get(
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    tagListByMaterialIdGet,
  );

router
  .route('/bymedia/:material/:tag_id')
  .delete(
    authenticate,
    param('material_id').isInt({min: 1}).toInt(),
    param('tag_id').isInt({min: 1}).toInt(),
    validationErrors,
    tagDeleteFromMaterial,
  );

router
  .route('/bytag/:tag_id')
  .get(
    param('tag_id').isInt({min: 1}).toInt(),
    validationErrors,
    tagFilesByTagGet,
  );

router
  .route('/:id')
  .delete(
    authenticate,
    param('id').isInt({min: 1}).toInt(),
    validationErrors,
    tagDelete,
  );

export default router;
