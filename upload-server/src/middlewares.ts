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
    console.log('🔹 Received file:', req.file);
    console.log('🔹 Request body:', req.body);

    // Check if file was uploaded
    if (!req.file) {
      console.error('No file uploaded');
      return next(new CustomError('File not uploaded', 400));
    }

    const { path: filePath, mimetype, filename, originalname } = req.file;
    console.log('Original file path:', filePath);
    console.log('Original file name:', originalname);
    console.log('MIME type:', mimetype);

    // Extract filename without extension
    const ext = path.extname(originalname); // e.g., ".png"
    const baseName = path.basename(filename, ext); // Safely remove the extension

    // Define thumbnail path
    const thumbnailPath = path.join(path.dirname(filePath), `${baseName}-thumb.png`);
    console.log('📌 Thumbnail path:', thumbnailPath);

    if (mimetype.startsWith('image')) {
      console.log('Processing image thumbnail...');
      try {
        await sharp(filePath)
          .resize(320, 320)
          .png()
          .toFile(thumbnailPath);
        console.log('Thumbnail saved at:', thumbnailPath);
        res.locals.thumbnail = thumbnailPath;
      } catch (error) {
        console.error('Sharp processing error:', error);
        return next(new CustomError('Thumbnail not created by sharp', 500));
      }
    } else if (mimetype.startsWith('video')) {
      console.log('🎥 Processing video thumbnails...');
      try {
        const screenshots: string[] = await getVideoThumbnail(filePath);
        console.log('Generated video screenshots:', screenshots);
        res.locals.screenshots = screenshots;
      } catch (error) {
        console.error('Video thumbnail generation error:', error);
        return next(new CustomError('Video thumbnails not created', 500));
      }
    } else {
      console.warn('Unsupported file type:', mimetype);
      return next(new CustomError('Unsupported file type', 400));
    }

    return next();
  } catch (error) {
    console.error('❌ Unexpected error in makeThumbnail:', error);
    return next(new CustomError('Thumbnail processing failed', 500));
  }
};



export {notFound, errorHandler, authenticate, makeThumbnail};
