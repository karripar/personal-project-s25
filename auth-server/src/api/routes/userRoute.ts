import express from 'express';
import {query} from 'express-validator';
import {
  checkEmailExists,
  checkToken,
  checkUsernameExists,
  userDelete,
  userDeleteAsAdmin,
  userGet,
  userListGet,
  userPost,
  userPut,
  userByUsernameGet,
  searchByUsername,
  profilePut,
  profilePicturePost,
  profilePictureGet,
  profilePicturePut,
  profilePictureDelete,
} from '../controllers/userController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';


const router = express.Router();


/**
 * @apiDefine UserGroup User API
 * All the APIs related to users
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

router.route('/').get(
  /**
   * @api {get} /users Get all users
   * @apiName GetUsers
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Get all users
   * @apiPermission none
   *
   * @apiSuccess {Object[]} users List of users
   * @apiSuccess {Number} users.id User ID
   * @apiSuccess {String} users.username Username
   * @apiSuccess {String} users.email Email
   * @apiSuccess {String} users.createdAt User creation date
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "id": 1,
   *    "username": "user1",
   *    "email": "
   *    "createdAt": "2021-01-01T00:00:00.000Z"
   *  },
   *  {
   *    "id": 2,
   *    "username": "user2",
   *    "email": "kaksk@email.com",
   *    "createdAt": "2021-01-01T00:00:00.000Z"
   *  }
   * ]
   *
   * @apiUse unauthorized
   */
  userListGet,
);

router.get(
  /**
   * @api {get} /users/byUsername/:username Get user by username
   * @apiName GetUserByUsername
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Get user by username
   * @apiPermission none
   *
   * @apiParam {String} username Username of the user
   *
   * @apiSuccess {Number} id User ID
   * @apiSuccess {String} username Username
   * @apiSuccess {String} email Email
   * @apiSuccess {String} createdAt User creation date
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "id": 1,
   *  "username": "user1",
   *  "email": "
   *  "createdAt": "2021-01-01T00:00:00.000Z"
   * }
   *
   * @apiUse unauthorized
   */
  '/byUsername/:username',
  userByUsernameGet,
);

router.post(
  /**
   * @api {post} /users Create user
   * @apiName CreateUser
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Create a new user
   * @apiPermission none
   *
   * @apiBody {String} username Username of the user
   * @apiBody {String} password Password of the user
   * @apiBody {String} email Email of the user
   *
   * @apiSuccess {Number} id User ID
   * @apiSuccess {String} username Username
   * @apiSuccess {String} email Email
   * @apiSuccess {String} createdAt User creation date
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *  "id": 1,
   *  "username": "user1",
   *  "email": "
   *  "createdAt": "2021-01-01T00:00:00.000Z"
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
  '/',
  body('username')
    .trim()
    .escape()
    .isLength({min: 3, max: 50})
    .withMessage('Username must be between 3-50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, underscores and dashes',
    ),
  body('password')
    .isString()
    .isLength({min: 5})
    .withMessage('Password must be at least 5 characters long'),
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email format'),
  validationErrors,
  userPost,
);

router.put(
  /**
   * @api {put} /users Update user
   * @apiName UpdateUser
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Update user
   * @apiPermission token
   *
   * @apiBody {String} [username] Username of the user
   * @apiBody {String} [password] Password of the user
   * @apiBody {String} [email] Email of the user
   *
   * @apiSuccess {Number} id User ID
   * @apiSuccess {String} username Username
   * @apiSuccess {String} email Email
   * @apiSuccess {String} createdAt User creation date
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "id": 1,
   *  "username": "user1",
   *  "email": "
   *  "createdAt": "2021-01-01T00:00:00.000Z"
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
  '/',
  authenticate,
  body('username')
    .optional()
    .trim()
    .escape()
    .isLength({min: 3, max: 50})
    .withMessage('Username must be between 3-50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, underscores and dashes',
    ),
  body('password')
    .optional()
    .isString()
    .isLength({min: 5})
    .withMessage('Password must be at least 5 characters long'),
  body('email')
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email format'),
  validationErrors,
  userPut,
);

router.put(
  /**
   * @api {put} /users/profileinfo Update user profile info
   * @apiName UpdateUserProfileInfo
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Update user profile info
   * @apiPermission token
   *
   * @apiParam {String} [username] Username of the user
   * @apiParam {String} [bio] Bio of the user
   *
   * @apiSuccess {Number} id User ID
   * @apiSuccess {String} username Username
   * @apiSuccess {String} bio Bio
   * @apiSuccess {String} createdAt User creation date
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "id": 1,
   *  "username": "user1",
   *  "bio": "bio",
   *  "createdAt": "2021-01-01T00:00:00.000Z"
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
  '/profileinfo',
  authenticate,
  body('username')
    .optional()
    .trim()
    .escape()
    .isLength({min: 3, max: 50})
    .withMessage('Username must be between 3-50 characters'),
  body('bio')
    .optional()
    .trim()
    .escape()
    .isLength({max: 300})
    .withMessage('Bio must be less than 255 characters'),
  validationErrors,
  profilePut,
);

router.delete(
  /**
   * @api {delete} /users Delete user
   * @apiName DeleteUser
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Delete user
   * @apiPermission token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 204 No Content
   *
   * @apiUse unauthorized
   */
  '/',
  authenticate,
  userDelete,
);

router
  .route('/profile/picture/:user_id')
  .get(
    /**
     * @api {get} /users/profile/picture/:user_id Get profile picture
     * @apiName GetProfilePicture
     * @apiGroup UserGroup
     * @apiVersion 1.0.0
     * @apiDescription Get profile picture
     * @apiPermission none
     *
     * @apiParam {Number} user_id User ID
     *
     * @apiSuccess {String} picture Profile picture URL
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "picture": "http://example.com/picture.jpg"
     * }
     *
     * @apiUse unauthorized
     */
    param('user_id').isNumeric(), validationErrors, profilePictureGet);

router
  .route('/profile/picture')
  .post(
    /**
     * @api {post} /users/profile/picture Upload profile picture
     * @apiName UploadProfilePicture
     * @apiGroup UserGroup
     * @apiVersion 1.0.0
     * @apiDescription Upload profile picture
     * @apiPermission token
     *
     * @apiSuccess {String} message Profile picture uploaded
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "message": "Profile picture uploaded"
     * }
     *
     * @apiUse unauthorized
     */
    validationErrors,
    authenticate,
    profilePicturePost,
  )
  .delete(
    /**
     * @api {delete} /users/profile/picture Delete profile picture
     * @apiName DeleteProfilePicture
     * @apiGroup UserGroup
     * @apiVersion 1.0.0
     * @apiDescription Delete profile picture
     * @apiPermission token
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "message": "Profile picture deleted"
     * }
     *
     * @apiUse unauthorized
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
     *     "error": "Unauthorized"
     *   }
     *
     * @apiError (Error 404) {String} NotFound Profile picture not found
     * @apiErrorExample {json} NotFound
     *    HTTP/1.1 404 Not Found
     *    {
     *      "error": "Profile picture not found"
     *    }
     */
    authenticate,
    profilePictureDelete,
  );

router
  .route('/update/picture/:user_id')
  .put(
    authenticate,
    param('user_id').isNumeric(),
    validationErrors,
    profilePicturePut,
  );

router.get(
  /**
   * @api {get} /users/token Check token
   * @apiName CheckToken
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Check if token is valid
   * @apiPermission token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "valid": true
   * }
   *
   * @apiUse unauthorized
   */
  '/token',
  authenticate,
  checkToken,
);

router
  .route(
    /**
     * @api {get} /users/:id Get user by ID
     * @apiName GetUser
     * @apiGroup UserGroup
     * @apiVersion 1.0.0
     * @apiDescription Get user by ID
     * @apiPermission none
     *
     * @apiParam {Number} id User ID
     *
     * @apiSuccess {Number} id User ID
     * @apiSuccess {String} username Username
     * @apiSuccess {String} email Email
     * @apiSuccess {String} createdAt User creation date
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 200 OK
     * {
     *  "id": 1,
     *  "username": "user1",
     *  "email": "
     *  "createdAt": "2021-01-01T00:00:00.000Z"
     * }
     *
     * @apiUse unauthorized
     */
    '/:id',
  )
  .get(param('id').isNumeric(), validationErrors, userGet);

router
  .route(
    '/:id',
  )
  .delete(
    /**
     * @api {delete} /users/:id Delete user by ID
     * @apiName DeleteUserById
     * @apiGroup UserGroup
     * @apiVersion 1.0.0
     * @apiDescription Delete user by ID
     * @apiPermission token
     *
     * @apiParam {Number} id User ID
     *
     * @apiSuccessExample {json} Success-Response:
     * HTTP/1.1 204 No Content
     *
     * @apiUse unauthorized
     */
    authenticate,
    param('id').isNumeric(),
    validationErrors,
    userDeleteAsAdmin,
  );

router.get(
  /**
   * @api {get} /email/:email Check if email exists
   * @apiName CheckEmailExists
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Check if email exists
   * @apiPermission none
   *
   * @apiParam {String} email Email
   *
   * @apiSuccess {Boolean} exists True if email exists, false otherwise
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "exists": true
   * }
   *
   * @apiUse unauthorized
   */
  '/email/:email',
  param('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid email format'),
  validationErrors,
  checkEmailExists,
);

router.get(
  /**
   * @api {get} /search/byusername Search by username
   * @apiName SearchByUsername
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Search by username
   * @apiPermission none
   *
   * @apiQuery {String} username Username
   *
   * @apiSuccess {Object[]} users List of users
   * @apiSuccess {Number} users.id User ID
   * @apiSuccess {String} users.username Username
   * @apiSuccess {String} users.email Email
   * @apiSuccess {String} users.createdAt User creation date
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "id": 1,
   *    "username": "user1",
   *    "email": "
   *    "createdAt": "2021-01-01T00:00:00.000Z"
   *  },
   *  {
   *    "id": 2,
   *    "username": "user2",
   *    "email": "
   *    "createdAt": "2021-01-01T00:00:00.000Z"
   *  }
   * ]
   *
   * @apiUse unauthorized
   */
  '/search/byusername',
  query('username')
    .optional()
    .trim()
    .escape()
    .isString()
    .isLength({min: 1, max: 50})
    .withMessage('Username must be between 3-50 characters'),
  validationErrors,
  searchByUsername,
);

router.get(
  /**
   * @api {get} /username/:username Check if username exists
   * @apiName CheckUsernameExists
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   * @apiDescription Check if username exists
   * @apiPermission none
   *
   * @apiParam {String} username Username
   *
   * @apiSuccess {Boolean} exists True if username exists, false otherwise
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "exists": true
   * }
   *
   * @apiUse unauthorized
   */
  '/username/:username',
  param('username')
    .trim()
    .escape()
    .isLength({min: 3, max: 50})
    .withMessage('Username must be between 3-50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, underscores and dashes',
    ),
  validationErrors,
  checkUsernameExists,
);

export default router;
