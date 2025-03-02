import { MediaRating, MediaComment, UserActivity, UserNotification, LatestNotification, LatestMedia } from "hybrid-types/DBTypes";
import {Request, Response, NextFunction} from 'express';
import { fetchMediaRatings, fetchLatestMedia, fetchLatestNotifications, fetchMediaComments, fetchUserActivity, fetchUserNotifications } from "../models/analyticsModel";


/**
 * JSDoc Documentation
 */


/**
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaRating[]>}
 * @description Get media ratings
 */
const getMediaRatings = async (
  req: Request,
  res: Response<MediaRating[]>,
  next: NextFunction,
) => {
  try {
    const ratings = await fetchMediaRatings();
    res.json(ratings);
  } catch (error) {
    next(error);
  }
};


// fetch number of comments per Media
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<MediaComment[]>}
 * @description Get media comments
 */
const getMediaComments = async (
  req: Request,
  res: Response<MediaComment[]>,
  next: NextFunction,
) => {
  try {
    const comments = await fetchMediaComments();
    res.json(comments);
  } catch (error) {
    next(error);
  }
};


// fetch user activity (number of Medias, comments, ratings)
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserActivity[]>}
 * @description Get user activity: number of Medias, comments, ratings
 */
const getUserActivity = async (
  req: Request,
  res: Response<UserActivity[]>,
  next: NextFunction,
) => {
  try {
    const activity = await fetchUserActivity(Number(res.locals.user.user_id));
    res.json(activity);
  } catch (error) {
    next(error);
  }
};


// fetch user notification count and unread count
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<UserNotification[]>}
 * @description Get user notifications
 */
const getUserNotifications = async (
  req: Request,
  res: Response<UserNotification[]>,
  next: NextFunction,
) => {
  try {
    const notifications = await fetchUserNotifications(Number(res.locals.user.user_id));
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};


// fetch latest notifications
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<LatestNotification[]>}
 * @description Get latest notifications
 */
const getLatestNotifications = async (
  req: Request,
  res: Response<LatestNotification[]>,
  next: NextFunction,
) => {
  try {
    const notifications = await fetchLatestNotifications(Number(res.locals.user.user_id));
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};


// fetch latest Medias
/**
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @returns {Promise<LatestMedia[]>}
 * @description Get latest Medias
 */
const getLatestMedias = async (
  req: Request,
  res: Response<LatestMedia[]>,
  next: NextFunction,
) => {
  try {
    const Medias = await fetchLatestMedia();
    res.json(Medias);
  } catch (error) {
    next(error);
  }
};

export { getMediaRatings, getMediaComments, getUserActivity, getUserNotifications, getLatestNotifications, getLatestMedias };
