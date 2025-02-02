import { Notification } from "hybrid-types/DBTypes";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import promisePool from "../../lib/db";
import {MessageResponse} from 'hybrid-types/MessageTypes';
import {ERROR_MESSAGES} from '../../utils/errorMessages';
import CustomError from '../../classes/CustomError';

const fetchNotificationsByUserId = async (user_id: number): Promise<Notification[]> => {
  const [rows] = await promisePool.execute<RowDataPacket[] & Notification[]>(
    `SELECT n.*, nt.notification_type_name
    FROM Notifications n
    JOIN NotificationTypes nt ON n.notification_type_id = nt.notification_type_id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC`, [user_id]
  );

  return rows;
};


const markNotificationAsRead = async (notification_id: number): Promise<MessageResponse> => {
  const [result] = await promisePool.execute<ResultSetHeader>(
    `UPDATE Notifications SET is_read = TRUE WHERE notification_id = ?`, [notification_id]
  );

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.NOTIFICATIONS.NOT_FOUND, 404);
  }

  return {message: 'Notification marked as read'};
};


const deleteNotification = async (notification_id: number): Promise<MessageResponse> => {
  const [result] = await promisePool.execute<ResultSetHeader>(
    `DELETE FROM Notifications WHERE notification_id = ?`, [notification_id]
  );

  if (result.affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.NOTIFICATIONS.NOT_DELETED, 404);
  }

  return {message: 'Notification deleted'};
};


const postNotification = async (
  user_id: number,
  notification_text: string,
  notification_type_id: number,
): Promise<MessageResponse> => {
  const result = await promisePool.execute<ResultSetHeader>(
    `INSERT INTO Notifications (user_id, notification_text, notification_type_id) VALUES (?, ?, ?)`, [user_id, notification_text, notification_type_id]
  );

  if (result[0].affectedRows === 0) {
    throw new CustomError(ERROR_MESSAGES.NOTIFICATIONS.NOT_CREATED, 500);
  }

  return { message: 'Notification created'};
};

export { fetchNotificationsByUserId, markNotificationAsRead, deleteNotification, postNotification };
