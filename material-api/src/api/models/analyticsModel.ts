import promisePool from "../../lib/db";
import { RowDataPacket } from "mysql2";
import { MaterialRating, MaterialComment, UserActivity, UserNotification, LatestNotification, LatestMaterial } from "hybrid-types/DBTypes";
import CustomError from "../../classes/CustomError";
import { ERROR_MESSAGES } from '../../utils/errorMessages';

// fetch average rating for all materials
const fetchMaterialRatings = async (): Promise<MaterialRating[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & MaterialRating[]>(
    `SELECT * FROM MaterialRatings`
  );

  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.RATING.NOT_FOUND, 404);
  }

  return rows;
};


// fetch number of comments per material
const fetchMaterialComments = async (): Promise<MaterialComment[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & MaterialComment[]>(
    `SELECT * FROM MaterialComments`
  );

  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.COMMENT.NOT_FOUND, 404);
  }

  return rows;
};


// fetch user activity (number of materials, comments, ratings)
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


// fetch latest materials uploaded
const fetchLatestMaterials = async (): Promise<LatestMaterial[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & LatestMaterial[]>(
    `SELECT * FROM LatestMaterials`
  );

  if (rows.length === 0) {
    throw new CustomError(ERROR_MESSAGES.MEDIA.NOT_FOUND, 404);
  }

  return rows;
}

export {
  fetchMaterialRatings,
  fetchMaterialComments,
  fetchUserActivity,
  fetchUserNotifications,
  fetchLatestMaterials,
  fetchLatestNotifications
};
