/* eslint-disable @typescript-eslint/no-unused-vars */
import {NextFunction, Request, Response} from 'express';
import {ErrorResponse} from 'hybrid-types/MessageTypes';
import CustomError from './classes/CustomError';
import jwt from 'jsonwebtoken';
import {TokenContent} from 'hybrid-types/DBTypes';
import path from 'path';
import getVideoThumbnail from './utils/getVideoThumbnail';
import sharp from 'sharp';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`🔍 - Not Found - ${req.originalUrl}`, 404);
  next(error);
};

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  console.error('errorHandler', err);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('authenticate');
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next(new CustomError('Authentication failed 1', 401));
      return;
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenContent;

    console.log(decodedToken);
    if (!decodedToken) {
      next(new CustomError('Authentication failed 2', 401));
      return;
    }

    res.locals.user = decodedToken;
    next();
  } catch (error) {
    next(new CustomError('Authentication failed 3', 401));
  }
};

const makeThumbnail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new CustomError('File not uploaded', 500));
    }

    console.log('Original file path:', req.file.path);

    // Extract the filename without extension
    console.log('Original file name:', req.file.originalname);
    const ext = path.extname(req.file.originalname); // e.g., ".jpg"
    const baseName = req.file.filename.replace(ext, ''); // Removes extension correctly

    // Construct the correct thumbnail path
    const thumbnailPath = path.join(path.dirname(req.file.path), `${baseName}-thumb.png`);
    console.log('Thumbnail path:', thumbnailPath);

    if (!req.file.mimetype.includes('video')) {
      await sharp(req.file.path)
        .resize(320, 320)
        .png()
        .toFile(thumbnailPath)
        .catch((error) => {
          console.error('Sharp error:', error);
          return next(new CustomError('Thumbnail not created by sharp', 500));
        });

      res.locals.thumbnail = thumbnailPath; // Store correctly formatted thumbnail path
      console.log('Thumbnail saved as:', thumbnailPath);
      return next();
    }

    // Handle video thumbnails
    const screenshots: string[] = await getVideoThumbnail(req.file.path);
    res.locals.screenshots = screenshots;
    next();
  } catch (error) {
    next(new CustomError('Thumbnail not created', 500));
  }
};



export {notFound, errorHandler, authenticate, makeThumbnail};
