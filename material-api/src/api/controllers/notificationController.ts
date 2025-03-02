import {Request, Response, NextFunction} from 'express';
import {
  fetchNotificationsByUserId,
  postNotification,
  deleteNotification,
  markNotificationAsRead,
} from '../models/notificationModel';
import {MessageResponse} from 'hybrid-types/MessageTypes';
import {Notification, TokenContent} from 'hybrid-types/DBTypes';


// list of notifications
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<Notification[]>}
 * @description Get all notifications
 */
const notificationListGet = async (
  req: Request,
  res: Response<Notification[], {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const notifications = await fetchNotificationsByUserId(
      Number(res.locals.user.user_id),
    );
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// create a new notification
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Post a new notification
 */
const notificationPost = async (
  req: Request,
  res: Response<MessageResponse, {user: TokenContent}>,
  next: NextFunction,
) => {
  try {
    const {notification_text, notification_type_id} = req.body;
    const result = await postNotification(
      Number(res.locals.user.user_id),
      notification_text,
      notification_type_id,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};


// mark notification as read
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Mark a notification as read
 */
const notificationMarkAsRead = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction,
) => {
  try {
    const result = await markNotificationAsRead(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// delete notification
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MessageResponse>}
 * @description Delete a notification
 */
const notificationDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction,
) => {
  try {
    const result = await deleteNotification(Number(req.params.id));
    res.json(result);
  } catch (error) {
    next(error);
  }
};


export {notificationListGet, notificationPost, notificationMarkAsRead, notificationDelete};
