import {Router} from 'express';
// import {} from '../data/whateverthefilenameis.js';
import { mediaData } from '../data/index.js';

const router = Router();

router
   .route('/')
   .get(async (req, res) => {
  //render the home.handlebars page if not then throw
  try {   
    res.render('media/search');
  } catch (e) {
    return res.status(500).send(e);
  }
});
router
   .route('/allmovies')
   .get(async (req, res) => {
  //render the home.handlebars page if not then throw
  try {    
    const media = await mediaData.getAllMovies();  
    res.render('media/viewallmovies',{media});
    //return res.json(media); 
  } catch (e) {
    return res.status(500).send(e);
  }
});
router
   .route('/allshows')
   .get(async (req, res) => {
  //render the home.handlebars page if not then throw
  try {   
    const media = await mediaData.getAllShows();   
    res.render('media/viewallshows',{media});
    //return res.json(media); 
  } catch (e) {
    return res.status(500).send(e);
  }
});
router
  .route('/search')
  .get(async (req, res) => {
    //render the home.handlebars page if not then throw
    try { 
      res.render('media/search');
      //return res.json(media); 
    } catch (e) {
      return res.status(500).send(e);
    }
  })
  .post(async (req, res) => {
    //code here for POST
    const {media_id} = req.body;
    try {      
        let media = await mediaData.getShowById(media_id);        
        if(!media){      
            media = await mediaData.getMovieById(media_id);
            //media = media_show;
        }
        if(media){
            //return res.json(media);
            res.render('media/view',{media});   
        } else{
            return res.status(404).render('media/search', { error: 'Media not found.' });
        }       
        //return res.json(media);     
      } catch (e) {
        return res.status(500).render('media/search', { error: e });
      }

  });

  router
  .route('/newShow')
  .get(async (req, res) => {
    try {
      res.render('media/addShow');
      //return res.json(media); 
    } catch (e) {
      return res.status(500).send(e);
    }
  })

  .post(async (req, res) => {
    //code here for POST
    const {title, overview, rating, airDate} = req.body;
    try {      
      const media = await mediaData.addMovie(title, overview, rating, airDate);
      //req.session.user = user;
      if (!media) {
        res.status(400).render('media/addShow', { error: 'Invalid search.' });
        return;
      }     
      res.render('media/view',{media});
      //return res.json(media); 
    
    } catch (e) {
      return res.status(400).render('media/addShow', { error: e });
    }
  });

  router
  .route('/newMovie')
  .get(async (req, res) => {
    try {
      res.render('media/addMovie');
      //return res.json(media); 
    } catch (e) {
      return res.status(500).send(e);
    }
  })

  .post(async (req, res) => {
    //code here for POST
    const {title, overview, rating, airDate} = req.body;
    try {      
      const media = await mediaData.addMovie(title, overview, rating, airDate);
      //req.session.user = user;
      if (!media) {
        res.status(400).render('media/addMovie', { error: 'Invalid search.' });
        return;
      }     
      res.render('media/view',{media});
      //return res.json(media); 
    
    } catch (e) {
      return res.status(400).render('media/addMovie', { error: e });
    }
  });


  router
  .route('/movies')
  .get(async (req, res) => {
    //render the home.handlebars page if not then throw
    try {
      const media = await mediaData.getAllMovies();   
      res.render('media/view',{media});
      //return res.json(media); 
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
      const newMovie = await mediaData.addMovie(movieInfo.overview, movieInfo.release_date, movieInfo.vote_average, movieInfo.genres);
      return res.json(newMovie);
    } catch (e) {
      return res.sendStatus(500).json({error: e});
    }
  });

router.route('/movies/add').get(async (req, res) => {
    try {
      const movie = await mediaData.getMovieById(req.params.id);
      return res.json(movie);
    } catch (e) {
      return res.status(404).json(e);
    }
  });



  
  
export default router;