import express from 'express'
import {Router} from 'express';
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
  export default router;
