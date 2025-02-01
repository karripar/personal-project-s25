import express, {Request, Response} from 'express';
import followRouter from './routes/followRoute';
import materialRouter from './routes/materialRoute';
import tagRouter from './routes/tagRoute';
import likeRouter from './routes/likeRoute';
import ratingRouter from './routes/ratingRoute';
import commentRouter from './routes/commentRoute';
import {MessageResponse} from 'hybrid-types/MessageTypes';

const router = express.Router();

router.get('/', (req: Request, res: Response<MessageResponse>) => {
  res.json({
    message: 'media api v1',
  });
});

router.use('/material', materialRouter);
router.use('/tags', tagRouter);
router.use('/likes', likeRouter);
router.use('/comments', commentRouter);
router.use('/ratings', ratingRouter);
router.use('/follows', followRouter);

export default router;
