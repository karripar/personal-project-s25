import { MediaRating, MediaComment, UserActivity, UserNotification, LatestNotification, LatestMedia } from "hybrid-types/DBTypes";
import {Request, Response, NextFunction} from 'express';
import { fetchMediaRatings, fetchLatestMedia, fetchLatestNotifications, fetchMediaComments, fetchUserActivity, fetchUserNotifications } from "../models/analyticsModel";


// fetch average rating for all Medias
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
