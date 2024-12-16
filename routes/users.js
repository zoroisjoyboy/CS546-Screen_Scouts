import {Router} from 'express';
import helpers from '../helpers.js';
import * as middleware from '../middleware.js'
import { signInUser, signUpUser } from '../data/users.js'; 
import {addToWatchlist, getWatchlist, getWatchedList,} from '../data/watchlist.js';
import { searchMoviesByTitle, getMovieById} from '../data/watchlist.js';
import {users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import axios from 'axios';

const router = Router();

router.use(middleware.logRequestAndRedirectRoot);

router.route('/').get(async (req, res) => {
  if (req.session && req.session.user) {
    res.render('home', {
      title: 'Home',
      userId: req.session.user._id,
      user: req.session.user
    });
    console.log('Session user:', req.session.user);
    console.log('Session userId:', req.session.user?._id);
  } else {
    res.render('home', {
      title: 'Home',
      user: null
    })
  }
});

const mediaKey = '59aac710b6daa17177d2087697f25bd7';
router.get('/search', async (req, res) => {
  console.log("dude");
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
  console.log('Request to /watched:', req.body);
  try {
    const { userId, id, type } = req.body; 

    if (!userId || !ObjectId.isValid(userId)) {
      console.error('Invalid userId:', userId);
      throw `Invalid userId: ${userId}`;
    }

    if (!id || !type) {
      console.error('Invalid id or type:', { id, type });
      throw `Invalid id: ${id} or type: ${type}`;
    }

    
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      console.error(`User not found with ID '${userId}'.`);
      throw `User with ID '${userId}' does not exist.`;
    }

    if (!user.watchlist || !Array.isArray(user.watchlist)) {
      console.error('User watchlist is not valid:', user.watchlist);
      throw `User watchlist is missing or invalid for userId: ${userId}`;
    }

    //  get the media in the watchlist
    const watchlistMedia = user.watchlist.find(
      (item) => item.mediaId.toString() === id && item.type === type
    );

    if (!watchlistMedia) {
      console.error('Media not found in watchlist:', { id, type });
      return res.status(404).json({ error: 'Media not found in watchlist.' });
    }

    // Move the media from watchlist to watched list
    const updatedList = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: { watchlist: { mediaId: id, type } },
        $addToSet: { watched: { mediaId: id, type } },
      }
    );

    console.log('Update Result:', updatedList);

    if (updatedList.modifiedCount === 0) {
      console.error('Failed to move media to watched list.');
      throw 'Failed to move media to watched list.';
    }

    console.log('Media moved to watched list:', { id, type });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error moving media to watched list:', error);
    res.status(500).json({ error: error?.toString() || 'Unknown error occurred' });
  }
});

  router.get('/user/:userId', async (req, res) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/signinuser');
    }
    try {
      const userId = req.params.userId;
      console.log('Getting profile for userId:', userId);
  
      // get valid the userId
      if (!ObjectId.isValid(userId)) throw new Error('Invalid userId');
  
      const usersCollection = await users();
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  
      if (!user) throw new Error(`User with ID '${userId}' does not exist.`);
  
      const watchlist = await getWatchlist(userId);
      const watched = await getWatchedList(userId);
      console.log('Watchlist data sent to frontend:', watchlist);
      console.log('Watched list data sent to frontend:', watched);
  
      res.render('userProfile', {
        user,
        //passing the watchlist data 
        watchlist, 
        watched
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
  
      res.render('searchResults', {title: 'Search Results', searchByTitle, movies});
    } catch (e) {
      console.error('Error fetching search results:', e);
      res.status(500).render('error', {message: 'An error occurred while fetching search results'});
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
  
      res.render('getmovie', {title: movie.title || movie.name, movie});
    } catch (e) {
      console.error('Error fetching movie/show details:', e);
      res.status(500).render('error', { message:'An error occurred while fetching movie/show details' });
    }
  });
  router
  .route('/signupuser')
  .get(middleware.redirectIfAuthenticated, async (req, res) => {
    const profilePics = [
      'profilePic1.png',
      'profilePic2.png',
      'profilePic3.png',
      'profilePic4.png',
      'profilePic5.png',
      'profilePic6.png',
      'profilePic7.png',
      'profilePic8.png'
    ];
    if (req.session && req.session.user) {
      return res.redirect('/');
    }
    res.render('signupuser', {
      profilePics
    });
})
.post(async (req, res) => {
  const profilePics = [
    'profilePic1.png',
    'profilePic2.png',
    'profilePic3.png',
    'profilePic4.png',
    'profilePic5.png',
    'profilePic6.png',
    'profilePic7.png',
    'profilePic8.png'
  ];


  let { email, firstName, lastName, userName, password, confirmPassword, birthday, profilePic } = req.body;

  try {
    if (!email || !firstName || !lastName || !userName || !password || !confirmPassword || !birthday || !profilePic) {
      throw new Error("All fields are required");
    }
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const registrationResult = await signUpUser(
      email,
      firstName,
      lastName,
      userName,
      password,
      birthday,
      profilePic
    );

    if (registrationResult.registrationCompleted) {
      return res.redirect('/');
    } else {
      return res.status(500).render('signupuser', {
        profilePics,
        error: 'Internal server error' 
      });
    }
  } catch (error) {
    return res.status(400).render('signupuser', { 
      profilePics,
      error 
    });
  }
});

router
.route('/signinuser')
.get(middleware.redirectIfAuthenticated, async (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  res.render('signinuser');
})
.post(async (req, res) => {
  let { userName, password } = req.body;
  try {

    userName = helpers.isValidString(userName, "Username");
    password = helpers.isValidString(password, "Password");

    const user = await signInUser(userName, password);
    if (user) {
      req.session.user = {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        birthday: user.birthday,
        profilePic: user.profilePic
      };
      let userId = user._id.toString();
      return res.status(200).redirect(`/user/${userId}`);
    }
  } catch (error) {
    return res.status(400).render('signinuser', { error });
  }
});

router.route('/signoutuser')
.get(middleware.checkSignOut, async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Unable to sign out');
    }
    res.render('signoutuser');
  });
});
  
export default router;
