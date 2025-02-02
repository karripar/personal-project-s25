import { MaterialRating, MaterialComment, UserActivity, UserNotification, LatestNotification, LatestMaterial } from "hybrid-types/DBTypes";
import {Request, Response, NextFunction} from 'express';
import { fetchMaterialRatings, fetchLatestMaterials, fetchLatestNotifications, fetchMaterialComments, fetchUserActivity, fetchUserNotifications } from "../models/analyticsModel";


// fetch average rating for all materials
const getMaterialRatings = async (
  req: Request,
  res: Response<MaterialRating[]>,
  next: NextFunction,
) => {
  try {
    const ratings = await fetchMaterialRatings();
    res.json(ratings);
  } catch (error) {
    next(error);
  }
};


// fetch number of comments per material
const getMaterialComments = async (
  req: Request,
  res: Response<MaterialComment[]>,
  next: NextFunction,
) => {
  try {
    const comments = await fetchMaterialComments();
    res.json(comments);
  } catch (error) {
    next(error);
  }
};


// fetch user activity (number of materials, comments, ratings)
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


// fetch latest materials
const getLatestMaterials = async (
  req: Request,
  res: Response<LatestMaterial[]>,
  next: NextFunction,
) => {
  try {
    const materials = await fetchLatestMaterials();
    res.json(materials);
  } catch (error) {
    next(error);
  }
};

export { getMaterialRatings, getMaterialComments, getUserActivity, getUserNotifications, getLatestNotifications, getLatestMaterials };
