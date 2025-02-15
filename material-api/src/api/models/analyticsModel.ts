import promisePool from "../../lib/db";
import { RowDataPacket } from "mysql2";
import { MediaRating, MediaComment, UserActivity, UserNotification, LatestNotification, LatestMedia } from "hybrid-types/DBTypes";
import CustomError from "../../classes/CustomError";
import { ERROR_MESSAGES } from '../../utils/errorMessages';

// fetch average rating for all media
const fetchMediaRatings = async (): Promise<MediaRating[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & MediaRating[]>(
    `SELECT * FROM MediaRatings`
  );

  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.RATING.NOT_FOUND, 404);
  }

  return rows;
};


// fetch number of comments per media
const fetchMediaComments = async (): Promise<MediaComment[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & MediaComment[]>(
    `SELECT * FROM MediaComments`
  );

  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.COMMENT.NOT_FOUND, 404);
  }

  return rows;
};


// fetch user activity (number of media, comments, ratings)
const fetchUserActivity = async (user_id: number): Promise<UserActivity[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & UserActivity[]>(
    `SELECT * FROM UserActivity WHERE user_id = ?`, [user_id]
  );

  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.ACTIVITY.NOT_FOUND, 404);
  }

  return rows;
};


// fetch user notification count and unread count
const fetchUserNotifications = async (user_id: number): Promise<UserNotification[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & UserNotification[]>(
    `SELECT * FROM UserNotifications WHERE user_id = ?`, [user_id]
  );

  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.NOTIFICATIONS.NOT_FOUND, 404);
  }

  return rows;
};


// fetch latest notifications
const fetchLatestNotifications = async (user_id: number): Promise<LatestNotification[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & LatestNotification[]>(
    `SELECT * FROM LatestNotifications WHERE user_id = ?`, [user_id]
  );

  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.NOTIFICATIONS.NOT_FOUND, 404);
  }

  return rows;
};


// fetch latest media uploaded
const fetchLatestMedia = async (): Promise<LatestMedia[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & LatestMedia[]>(
    `SELECT * FROM LatestMedia`
  );

  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND, 404);
  }

  return rows;
}

export {
  fetchMediaRatings,
  fetchMediaComments,
  fetchUserActivity,
  fetchUserNotifications,
  fetchLatestMedia,
  fetchLatestNotifications
};
