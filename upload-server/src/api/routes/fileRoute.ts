import express, {Request} from 'express';
import {deleteFile, uploadFile} from '../controllers/uploadController';
import multer, {FileFilterCallback} from 'multer';
import {authenticate, makeThumbnail} from '../../middlewares';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf', 'text/plain'];

const fileFilter = (
  _request: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  console.log('file', file);
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    throw new Error('Invalid file type');
  }
};
const upload = multer({dest: './uploads/', fileFilter});
const router = express.Router();

router
  .route('/upload')
  .post(authenticate, upload.single('file'), makeThumbnail, uploadFile);

router.route('/delete/:filename').delete(authenticate, deleteFile);

export default router;
