import express from 'express'
import {Router} from 'express';
import {isValidID} from '../helpers.js';
import { addToWatchlist, getWatchlist} from '../data.js';
import { users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';


const router = Router();

router.route('/').get(async (req, res) => {
  if (req.session && req.session.user) {
    res.render('home', {
      title: 'Home',
      user: req.session.user
    });
  } else {
    res.render('home', {
      title: 'Home',
      user: null
    })
  }
});

router.route('/user/:id').get(async (req, res) => {
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
    if (req.session.user) {
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
    } else {
      return res.redirect('/');
    }
  }
  catch (e) {
    console.error('Error obtaining user profile:', e);
    res.status(400).json({ error: e.toString() || 'Unknown error occurred' });
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
        return res.redirect('/signinuser');
      } else {
        return res.status(500).render('signupuser', {
          error: 'Internal server error' 
        });
      }
    } catch (error) {
      return res.status(400).render('signupuser', { error });
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