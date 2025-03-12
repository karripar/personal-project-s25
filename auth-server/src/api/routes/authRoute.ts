import express from 'express';
import {login} from '../controllers/authController';
import {body} from 'express-validator';
import {validationErrors} from '../../middlewares';

const router = express.Router();

/**
 * @apiDefine all All APIs
 * All the APIs
 */


/**
 * @apiDefine token Authentication required in the form of a token
 * @apiHeader token should be passed in the header as 'Authorization': 'Bearer <token>'
 */

/**
 * @apiDefine unauthorized Unauthorized
 * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
 * @apiErrorExample {json} Unauthorized
 *    HTTP/1.1 401 Unauthorized
 *    {
 *      "error": "Unauthorized"
 *    }
 */

router.post(
  /**
   * @api {post} /login Login
   * @apiName Login
   * @apiGroup AuthGroup
   * @apiVersion 1.0.0
   * @apiDescription Login to the application
   * @apiPermission none
   *
   * @apiBody {String} email Email of the user
   * @apiBody {String} password Password of the user
   *
   * @apiSuccess {String} token Token to be used for authentication
   * @apiSuccess {object} user User object
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "token": "Bearer <token
   *  "user": {
   *    "id": 1,
   *    "email": "
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
   * @apiErrorExample {json} Unauthorized
   *    HTTP/1.1 401 Unauthorized
   *    {
   *      "error": "Unauthorized"
   *    }
   *
   */
  '/login',
  body('email')
    .isString()
    .trim()
    .escape()
    .isLength({min: 3, max: 50})
    .withMessage('Email must be between 3-50 characters'),
  body('password')
    .isString()
    .isLength({min: 5})
    .withMessage('Password must be at least 5 characters long'),
  validationErrors,
  login,
);

export default router;
