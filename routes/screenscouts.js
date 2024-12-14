import express from 'express'
import {Router} from 'express';
import {isValidID} from '../helpers.js';
import {addToWatchlist, getWatchlist} from '../data/watchlist.js';
import { searchMoviesByTitle, getMovieById} from '../data/watchlist.js';
import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import axios from 'axios';

const router = Router();

router.get('/', async (req, res) => {
  try{ 
  console.log('Home route accessed');
  res.render('home', {title: 'Home'});
} catch (e) {
  console.log('Cannot get homepage');
  res.status(500).send('There was an error getting the homepage');
}
})

const mediaKey = '59aac710b6daa17177d2087697f25bd7';
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.query;
    const page = parseInt(req.query.page, 10) || 1;

    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
      params: {
        api_key: mediaKey,
        query: searchTerm,
        page,
      },
    });

    res.status(200).json({
      results: response.data.results,
      total_pages: response.data.total_pages,
    });
  } catch (error) {
    console.error('Error searching:', error.message);
    res.status(500).json({ error: 'Failed to get search results' });
  }
});

router.post('/watchlist', async (req, res) => {
  try {
    const { userId, mediaId, type } = req.body;

    // get valid ids
    if (!ObjectId.isValid(userId)) throw `Invalid userId: ${userId}`;
    if (!ObjectId.isValid(mediaId)) throw `Invalid mediaId: ${mediaId}`;
    console.log('Validated IDs:', { userId, mediaId, type });

    // call the addToWatchlist function
    const result = await addToWatchlist(userId, mediaId, type);
    console.log('addToWatchlist result:', result);

    if (result) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false, message: 'Media already exists in the watchlist.' });
    }
  } 
  catch (e) {
    console.error('Error in POST /watchlist:', e);
    res.status(400).json({ error: e.toString()});
  }
});

router.post('/watched', async (req, res) => {
  try {
    const { userId, mediaId, type } = req.body;

    if (!ObjectId.isValid(userId)) throw `Invalid userId: ${userId}`;
    if (!ObjectId.isValid(mediaId)) throw `Invalid mediaId: ${mediaId}`;

    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) throw `User with ID '${userId}' does not exist.`;

    // see if the item is in the watchlist
    const watchlistMedia = user.watchlist.find(
      (item) => item.mediaId.toString() === mediaId && item.type === type
    );

    if (!watchlistMedia) {
      return res.status(404).json({ error: 'Media not found in watchlist.' });
    }

    // pull the media from watchlist and add to the watched list
    const updatedList = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: { watchlist: { mediaId: new ObjectId(mediaId), type } },
        $addToSet: { watched: { mediaId: new ObjectId(mediaId), type } },
      }
    );

    if (updatedList.modifiedCount === 0) {
      throw 'Failed to move media to watched list.';
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error moving media to watched list:', error);
    res.status(500).json({ error: error?.toString() || 'Unknown error occurred' });
  }
});



  router.get('/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log('Getting profile for userId:', userId);
  
      // get valid the userId
      if (!ObjectId.isValid(userId)) throw new Error('Invalid userId');
  
      const usersCollection = await users();
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  
      if (!user) throw new Error(`User with ID '${userId}' does not exist.`);
  
      const watchlist = await getWatchlist(userId);
  
      res.render('userProfile', {
        title: `${user.name}'s Profile`,
        email: user.email,
        //passing the watchlist data 
        watchlist, 
      });
    } 
    catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).render('error', { message: 'Failed to get user profile.' });
    }
  });
     
  router.route('/moviesearch').post(async (req, res) => {
    const searchByTitle = (req.body && req.body.searchByTitle && req.body.searchByTitle.trim()) || '';
  
    if (!searchByTitle) {
      return res.status(400).render('error', { message: 'Please provide a search term!' });
    }
  
    try {
      const movies = await searchMoviesByTitle(searchByTitle);
  
      if (movies.length === 0) {
        return res.status(404).render('error', { message: `No results found for "${searchByTitle}"` });
      }
  
      res.render('searchResults', { title: 'Search Results', searchByTitle, movies });
    } catch (e) {
      console.error('Error fetching search results:', e);
      res.status(500).render('error', { message: 'An error occurred while fetching search results' });
    }
  });

  router.route('/getmovie/:id').get(async (req, res) => {
    const movieId = req.params.id;
    const type = req.query.type || 'movie'; 
  
    try {
      const movie = await getMovieById(movieId, type);
  
      if (!movie) {
        return res.status(404).render('error', { message: 'No movie/show found with that ID' });
      }
  
      res.render('getmovie', { title: movie.title || movie.name, movie });
    } catch (e) {
      console.error('Error fetching movie/show details:', e);
      res.status(500).render('error', { message: 'An error occurred while fetching movie/show details' });
    }
  });
  
  export default router;