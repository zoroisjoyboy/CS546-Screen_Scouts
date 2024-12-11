/*import express from 'express'
import {Router} from 'express';
import {isValidID} from '../helpers.js';
// import {} from '../data/whateverthefilenameis.js';


const router = Router();

router.route('/').get(async (req, res) => {
    //render the home.handlebars page if not then throw
    try {
      res.render('home', {title: 'Home'});
    }
    catch(e) {
      console.log('Cannot get homepage');
      res.status(500).send('There was an error getting the homepage');
    }

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

  router.route('/view').get(async (req, res) => {
    try {
      const movie = await movieData.getMovieById(req.params.id);
      return res.json(movie);
    } catch (e) {
      return res.status(404).json(e);
    }
  });
  
  router.route('/moviesearch').post(async (req, res) => {
    //code here for POST this is where your form will be submitting searchByTitle
    // and then call your data function passing in the searchByTitle 
    //and then rendering the search results of up to 50 Movies.
    
    const searchByTitle1 = req.body;
      if (!searchByTitle) {
        return res.status(400).render({ error: 'Invalid movie title.' });
      }
  
      try {
        const movies = await searchMoviesByTitle(searchByTitle1);
        if (movies.length === 0) {
          return res.status(404).render({ error: `No results found for "${searchByTitle1}"`, title: 'Movies Found' });
        }
        res.render('searchResults', {movies, searchByTitle1 });
      } catch (e) {
        res.status(500).render({ error: e});
      }
  });

  //----------------------------------------

  router.get('/', (req, res) => {
    res.render('media/view', { media: mediaData });
});

router.get('/add', (req, res) => {
    res.render('media/add');
});

router.post('/add', (req, res) => {
    const { title, synopsis, rating, genre, director, type, airedDate } = req.body;
    mediaData.push({ title, synopsis, rating, genre, director, type, airedDate });
    res.redirect('/media');*/