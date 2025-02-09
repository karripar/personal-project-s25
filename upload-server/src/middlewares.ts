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

    console.log('polku', req.file.path);

    const isImage = req.file.mimetype.startsWith('image/'); // ✅ Only allow images
    const isVideo = req.file.mimetype.startsWith('video/'); // ✅ Check for videos

    if (isImage) {
      try {
        const thumbnailPath = req.file.path + '-thumb.png';

        await sharp(req.file.path)
          .resize(320, 320)
          .png()
          .toFile(thumbnailPath);

        console.log('Thumbnail created:', thumbnailPath);
        res.locals.thumbnail = thumbnailPath;
      } catch (error) {
        console.error('Sharp error:', error);
        return next(new CustomError('Thumbnail creation failed', 500));
      }

      return next();
    }

    if (isVideo) {
      try {
        const screenshots: string[] = await getVideoThumbnail(req.file.path);
        res.locals.screenshots = screenshots;
        console.log('Video thumbnails created:', screenshots);
      } catch (error) {
        console.error('Video thumbnail error:', error);
        return next(new CustomError('Video thumbnail creation failed', 500));
      }

      return next();
    }

    // If file is neither an image nor a video, just move to the next middleware
    console.log('No thumbnail created: unsupported file type', req.file.mimetype);
    next();
  } catch (error) {
    next(new CustomError('Unexpected error in makeThumbnail', 500));
  }
};


export {notFound, errorHandler, authenticate, makeThumbnail};
