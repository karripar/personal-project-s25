import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import fs from 'fs';
import {TokenContent} from 'hybrid-types/DBTypes';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import path from 'path';

const UPLOAD_DIR = './uploads';

type UploadResponse = MessageResponse & {
  data: {
    filename: string;
    media_type: string;
    filesize: number;
    screenshots?: string[];
  };
};

const uploadFile = async (
  req: Request,
  res: Response<UploadResponse, { user: TokenContent; screenshots: string[] }>,
  next: NextFunction
) => {
  const tempFiles: string[] = [];

  try {
    console.log('🔹 Upload request received:', req.file);

    // Validate file upload
    if (!req.file) {
      throw new CustomError('File not valid', 400);
    }

    const { path: tempPath, mimetype, size, originalname, filename } = req.file;
    console.log('📁 Temp file path:', tempPath);

    const extension = path.extname(originalname); // Extracts ".png", ".mp4", etc.
    if (!extension) {
      throw new CustomError('Invalid file extension', 400);
    }

    // Append user_id to filename while preserving extension
    const newFilename = `${path.basename(filename, extension)}_${res.locals.user.user_id}${extension}`;
    const targetPath = path.join(UPLOAD_DIR, newFilename);

    tempFiles.push(tempPath);

    try {
      // Move uploaded file
      fs.renameSync(tempPath, targetPath);
      console.log('✅ File moved to:', targetPath);

      // Handle image thumbnails
      const thumbPath = `${tempPath}-thumb.png`;
      if (fs.existsSync(thumbPath)) {
        const targetThumbPath = path.join(UPLOAD_DIR, `${newFilename}-thumb.png`);
        fs.renameSync(thumbPath, targetThumbPath);
        console.log('✅ Thumbnail moved to:', targetThumbPath);
      }

      // Handle video screenshots
      if (res.locals.screenshots?.length > 0) {
        res.locals.screenshots = res.locals.screenshots.map((screenshot) => {
          const screenshotName = path.basename(screenshot);
          const targetScreenshotPath = path.join(UPLOAD_DIR, `${newFilename}-thumb-${screenshotName}`);
          fs.renameSync(screenshot, targetScreenshotPath);
          console.log('📸 Video screenshot moved to:', targetScreenshotPath);
          return `${newFilename}-thumb-${screenshotName}`;
        });
      }
    } catch (error) {
      console.error('❌ Error moving files:', error);
      cleanup(tempFiles);
      throw new CustomError('Error processing files', 500);
    }

    // Build response
    const response: UploadResponse = {
      message: 'File uploaded successfully',
      data: {
        filename: newFilename,
        media_type: mimetype,
        filesize: size,
        ...(mimetype.includes('video') && { screenshots: res.locals.screenshots }),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Upload error:', error);
    cleanup(tempFiles);
    next(error instanceof CustomError ? error : new CustomError((error as Error).message, 400));
  }
};

const deleteFile = async (
  req: Request<{filename: string}>,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction
) => {
  try {
    const {filename} = req.params;
    if (!filename) {
      throw new CustomError('filename not valid', 400);
    }

    // Check ownership by extracting user_id from filename
    if (res.locals.user.level_name !== 'Admin') {
      const fileUserId = filename.split('_').pop()?.split('.')[0];
      if (!fileUserId || fileUserId !== res.locals.user.user_id.toString()) {
        throw new CustomError('user not authorized', 401);
      }
    }

    const filePath = `${UPLOAD_DIR}/${filename}`;
    const thumbPath = `${UPLOAD_DIR}/${filename}-thumb.png`;

    if (!fs.existsSync(filePath)) {
      throw new CustomError('file not found', 404);
    }

    try {
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
      fs.unlinkSync(filePath);
    } catch {
      throw new CustomError('Error deleting files', 500);
    }

    res.json({message: 'File deleted'});
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError((error as Error).message, 400)
    );
  }
};

// Helper function to clean up temporary files
const cleanup = (files: string[]) => {
  files.forEach((file) => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (error) {
      console.error(`Error cleaning up file ${file}:`, error);
    }
  });
};

export {uploadFile, deleteFile};
