import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import {notFound, errorHandler} from './middlewares';
import api from './api';

const app = express();

app.use(morgan('dev'));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      imgSrc: ["'self'", 'data:', 'http://localhost:5173'],
    },
  }),
);
app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  origin: '*',
}));

app.use(express.json());

// serve public folder for apidoc
app.use(express.static('public'));

app.use('/api/v1', api);

app.use(notFound);
app.use(errorHandler);

export default app;
