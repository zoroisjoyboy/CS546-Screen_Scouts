import movieRoutes from './movies.js';
import showRoutes from './shows.js';

const constructorMethod = (app) => {
  app.use('/movies', movieRoutes);
  app.use('/shows', showRoutes);
  
  app.use('*', (req, res) => {
    return res.status(404).json({error: 'Not found'});
  });
};

export default constructorMethod;