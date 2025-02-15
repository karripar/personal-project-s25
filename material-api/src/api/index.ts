import express, {Request, Response} from 'express';
import followRouter from './routes/followRoute';
import mediaRouter from './routes/mediaRoute';
import tagRouter from './routes/tagRoute';
import likeRouter from './routes/likeRoute';
import ratingRouter from './routes/ratingRoute';
import commentRouter from './routes/commentRoute';
import { favoriteRouter } from './routes/favoriteRoute';
import notificationRouter from './routes/notificationRoute';
import analyticsRouter from './routes/analyticsRoute';
import {MessageResponse} from 'hybrid-types/MessageTypes';

const router = express.Router();

router.get('/', (req: Request, res: Response<MessageResponse>) => {
  res.json({
    message: 'media api v1',
  });
});

router.use('/media', mediaRouter);
router.use('/tags', tagRouter);
router.use('/likes', likeRouter);
router.use('/comments', commentRouter);
router.use('/ratings', ratingRouter);
router.use('/follows', followRouter);
router.use('/notifications', notificationRouter);
router.use('/analytics', analyticsRouter);
router.use('/favorites', favoriteRouter);

export default router;
