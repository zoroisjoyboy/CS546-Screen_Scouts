import {Router} from 'express';
// import {} from '../data/whateverthefilenameis.js';
import { movieData } from '../data/index.js';
import validation from '../data/validation.js';

const router = Router();

router
  .route('/')
  .get(async (req, res) => {
    //render the home.handlebars page if not then throw
    try {
      const movieList = await movieData.getAllMovies();   
      return res.json(movieList); 
    } catch (e) {
      return res.status(500).send(e);
    }
  })
  .post(async (req, res) => {  
    const movieInfo = req.body;
    //make sure there is something present in the req.body
    if (!movieInfo || Object.keys(movieInfo).length === 0) {
      return res
        .status(400)
        .json({error: 'There are no fields in the request body'});
    }
    //check all inputs, that should respond with a 400
    try {
      movieInfo.overview = validation.checkString(movieInfo.overview, 'overview');
      movieInfo.release_date = validation.checkString(movieInfo.release_date, 'release_date');
      movieInfo.vote_average = validation.checkString(movieInfo.vote_average, 'vote_average');
      movieInfo.genres = validation.checkString(movieInfo.genres, 'genres');
  
    } catch (e) {
      return res.status(400).json({error: e});
    }
          
    //insert the movie
    try {
      const newMovie = await movieData.addMovie(movieInfo.overview, movieInfo.release_date, movieInfo.vote_average, movieInfo.genres);
      return res.json(newMovie);
    } catch (e) {
      return res.sendStatus(500).json({error: e});
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