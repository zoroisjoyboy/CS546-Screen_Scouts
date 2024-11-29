import {Router} from 'express';
// import {} from '../data/whateverthefilenameis.js';
import { movieData } from '../data/index.js';

const router = Router();

router.route('/').get(async (req, res) => {
    //render the home.handlebars page if not then throw
    try {
      const movieList = await movieData.getAllMovies();   
      return res.json(movieList); 
    } catch (e) {
      return res.status(500).send(e);
    }
  });

router.route('/:id').get(async (req, res) => {
    try {
      const movie = await movieData.getMovieById(req.params.id);
      return res.json(movie);
    } catch (e) {
      return res.status(404).json(e);
    }
  });
  
  export default router;