// import mediaRoutes from './media.js';
import userRoutes from './users.js';
import mediaRoutes from './media.js';
import {static as staticDir} from 'express';

const constructorMethod = (app) => {
  // app.use('/', mediaRoutes);
  app.use('/', userRoutes);
  app.use('/public', staticDir('public'));
  
  app.use('*', (req, res) => {
    return res.status(404).json({error: 'Not found'});
  });
};

export default constructorMethod;
