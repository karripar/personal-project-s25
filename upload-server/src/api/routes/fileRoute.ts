import express, {NextFunction, Request, Response} from 'express';
import {deleteFile, uploadFile, deleteProfileFile} from '../controllers/uploadController';
import multer from 'multer';
import {authenticate, makeThumbnail} from '../../middlewares';
import CustomError from '../../classes/CustomError';
import {TokenContent} from 'hybrid-types/DBTypes';
import randomstring from 'randomstring';
import { param } from 'express-validator';

/**
 * @apiDefine FileUploadGroup File Upload
 * File upload routes
 */

/**
 * @apiDefine token
 * @apiHeader {String} Authorization User's access token
 * @apiHeaderExample {json} Authorization
 *  {
 *    "Authorization": "bearer <token>"
 *  }
 */

/**
 * @apiDefine unauthorized
 * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
 */

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const userId = (req as Request).res?.locals.user.user_id;
    const extension = file.originalname.split('.').pop();
    // generate random filename
    const randomName = randomstring.generate(20);
    const newFilename = `${randomName}_${userId}.${extension}`;
    cb(null, newFilename);
  },
});

const profileStorage = multer.diskStorage({
  destination: './uploads/profile',
  filename: (req, file, cb) => {
    const userId = (req as Request).res?.locals.user.user_id;
    const extension = file.originalname.split('.').pop();
    // generate random filename
    const randomName = randomstring.generate(20); // random string
    const newFilename = `${randomName}_${userId}.${extension}`;
    cb(null, newFilename);
  },
});

const upload = multer({storage}).single('file');

const profileUpload = multer({storage: profileStorage}).single('file');

const doUpload = (
  req: Request,
  res: Response<unknown, {user: TokenContent}>,
  next: NextFunction,
) => {
  upload(req, res, (err) => {
    if (err) {
      next(new CustomError(err.message, 400));
      return;
    }

    if (
      req.file &&
      (req.file.mimetype.includes('image') ||
        req.file.mimetype.includes('video'))
    ) {
      next();
    }
  });
};

const router = express.Router();

router.route('/upload').post(
  /**
   * @api {post} /upload Upload a file
   * @apiName UploadFile
   * @apiGroup FileUploadGroup
   * @apiPermission user
   * @apiDescription Upload a file
   *
   * @apiUse token
   * @apiUse unauthorized
   * @apiSuccess {String} message File uploaded successfully
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "message": "File uploaded successfully",
   *  "data": {
   *    "filename": "randomname_1.jpg",
   *    "filesize": 12345,
   *    "mimetype": "image/jpeg"
   *  }
   * }
   * @apiError (Error 400) {String} BadRequest Invalid request
   * @apiErrorExample {json} BadRequest
   *    HTTP/1.1 400 Bad Request
   *    {
   *      "error": "Invalid request"
   *    }
   * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
   *
   * @apiError (Error 400) {String} BadRequest Invalid request
   * @apiErrorExample {json} BadRequest
   *    HTTP/1.1 400 Bad Request
   *    {
   *      "error": "Invalid request"
   *    }
   */
  authenticate, doUpload, makeThumbnail, uploadFile);

router.route('/profile').post(
  /**
   * @api {post} /upload/profile Upload a profile picture
   * @apiName UploadProfilePicture
   * @apiGroup FileUploadGroup
   * @apiPermission user
   * @apiDescription Upload a profile picture
   * @apiUse token
   * @apiUse unauthorized
   * @apiSuccess {String} message File uploaded successfully
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "message": "File uploaded successfully",
   *  "data": {
   *    "filename": "randomname_1.jpg",
   *    "filesize": 12345,
   *    "mimetype": "image/jpeg"
   *  }
   * }
   * @apiError (Error 400) {String} BadRequest Invalid request
   * @apiErrorExample {json} BadRequest
   *    HTTP/1.1 400 Bad Request
   *    {
   *      "error": "Invalid request"
   *    }
   * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
   */
  authenticate, profileUpload, uploadFile);

router.route('/delete/:filename').delete(
  /**
   * @api {delete} /upload/delete/:filename Delete a file
   * @apiName DeleteFile
   * @apiGroup FileUploadGroup
   * @apiPermission user
   * @apiDescription Delete a file
   * @apiParam {String} filename Filename to delete
   * @apiUse token
   * @apiUse unauthorized
   * @apiSuccess {String} message File deleted successfully
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "message": "File deleted successfully"
   * }
   * @apiError (Error 400) {String} BadRequest Invalid request
   * @apiErrorExample {json} BadRequest
   *    HTTP/1.1 400 Bad Request
   *    {
   *      "error": "Invalid request"
   *    }
   * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
   */
  authenticate, deleteFile);

router.route('/profile/picture/:filename').delete(
  /**
   * @api {delete} /upload/profile/picture Delete a profile picture
   * @apiName DeleteProfilePicture
   * @apiGroup FileUploadGroup
   * @apiPermission user
   * @apiDescription Delete a profile picture
   *
   * @apiUse token
   * @apiUse unauthorized
   * @apiSuccess {String} message File deleted successfully
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "message": "File deleted successfully"
   * }
   * @apiError (Error 400) {String} BadRequest Invalid request
   * @apiErrorExample {json} BadRequest
   *   HTTP/1.1 400 Bad Request
   *  {
   *   "error": "Invalid request"
   * }
   * @apiError (Error 401) {String} Unauthorized User is not authorized to access the resource
   */
  param('filename').isString(),
  deleteProfileFile);

export default router;
