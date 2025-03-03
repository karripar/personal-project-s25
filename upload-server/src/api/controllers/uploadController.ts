import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import fs from 'fs';
import {MessageResponse} from 'hybrid-types/MessageTypes';


const UPLOAD_DIR = './uploads';
const PROFILE_DIR = './uploads/profile';

type UploadResponse = MessageResponse & {
  data: {
    filename: string;
    media_type: string;
    filesize: number;
    screenshots?: string[];
  };
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UploadResponse>}
 * @description Upload a file
 */
const uploadFile = async (
  req: Request,
  res: Response<UploadResponse>,
  next: NextFunction,
) => {
  const tempFiles: string[] = [];
  try {
    if (!req.file) {
      throw new CustomError('file not valid', 400);
    }

    const extension = req.file.originalname.split('.').pop();
    if (!extension) {
      throw new CustomError('Invalid file extension', 400);
    }

    const response: UploadResponse = {
      message: 'file uploaded',
      data: {
        filename: req.file.filename,
        media_type: req.file.mimetype,
        filesize: req.file.size,
      },
    };

    res.json(response);
  } catch (error) {
    cleanup(tempFiles);
    next(
      error instanceof CustomError
        ? error
        : new CustomError((error as Error).message, 400),
    );
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Delete a file
 */
const deleteFile = async (
  req: Request<{filename: string}>,
  res: Response<MessageResponse>,
  next: NextFunction,
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
        : new CustomError((error as Error).message, 400),
    );
  }
};

/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Delete a profile file
 */
const deleteProfileFile = async (
  req: Request<{ filename: string }, object, { user_id: number }>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const { filename } = req.params;
    const { user_id } = req.body; 

    if (!filename || !user_id) {
      throw new CustomError("Invalid request", 400);
    }

    const fileUserId = filename.split("_").pop()?.split(".")[0];

    if (!fileUserId || fileUserId !== user_id.toString()) {
      throw new CustomError("Unauthorized", 401);
    }

    const filePath = `${PROFILE_DIR}/${filename}`;
    if (!fs.existsSync(filePath)) {
      throw new CustomError("file not found", 404);
    }

    fs.unlinkSync(filePath);
    res.json({ message: "File deleted" });
  } catch (error) {
    next(error instanceof CustomError ? error : new CustomError((error as Error).message, 400));
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

export {uploadFile, deleteFile, deleteProfileFile};
