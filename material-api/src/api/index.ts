import express, {Request, Response} from 'express';

import materialRoute from './routes/materialRoute';
import tagRoute from './routes/tagRoute';
import likeRoute from './routes/likeRoute';
import ratingRoute from './routes/ratingRoute';
import commentRouter from './routes/commentRoute';
import {MessageResponse} from 'hybrid-types/MessageTypes';

const router = express.Router();

router.get('/', (req: Request, res: Response<MessageResponse>) => {
  res.json({
    message: 'media api v1',
  });
});

router.use('/material', materialRoute);
router.use('/tags', tagRoute);
router.use('/likes', likeRoute);
router.use('/comments', commentRouter);
router.use('/likes', likeRoute);
router.use('/ratings', ratingRoute);

export default router;
