import express from 'express'
import {Router} from 'express';
import {isValidID} from '../helpers.js';
import { addToWatchlist, getWatchlist} from '../data.js';
import { users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';


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
});

router.route('/user/:id').get(async (req, res) => { // id is username
  let userId;
  try {
    userId = isValidID(req.params.id);
  } catch (e) {
    res.status(404).render('error');
  }
  try {
    res.status(200).render('userProfile', {
      userId: userId
    });
  } catch (e) {
    res.status(500).render('error');
  }
});

router.post('/watchlist', async (req, res) => {
  try {
    const { userId, mediaId, type } = req.body;

    // Validate IDs
    if (!ObjectId.isValid(userId)) throw `Invalid userId: ${userId}`;
    if (!ObjectId.isValid(mediaId)) throw `Invalid mediaId: ${mediaId}`;
    console.log('Validated IDs:', { userId, mediaId, type });

    // Call the addToWatchlist function
    const result = await addToWatchlist(userId, mediaId, type);
    console.log('addToWatchlist result:', result);

    if (result) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false, message: 'Media already exists in the watchlist.' });
    }
  } catch (e) {
    console.error('Error in POST /watchlist:', e);
    res.status(400).json({ error: e?.toString() || 'Unknown error occurred' });
  }
});


  router.get('/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log('Fetching profile for userId:', req.params.userId);
  
      // Validate the userId
      if (!ObjectId.isValid(userId)) throw 'Invalid userId';
  
      const usersCollection = await users();
  
      // Fetch the user's profile
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      console.log('User getting from db:', user);
  
      if (!user) throw `User with ID '${userId}' does not exist.`;
  
      // Respond with the user profile, including the watchlist
      res.status(200).json({
        name: user.name,
        email: user.email,
        watchlist: user.watchlist || [], // Return an empty array if watchlist is undefined
      });
    } 
    catch (e) {
      console.error('Error obtaining user profile:', e);
      res.status(400).json({ error: e?.toString() || 'Unknown error occurred' });
    }
  });
 
  export default router;