import express from 'express'
import {Router} from 'express';
import {isValidID} from '../helpers.js';


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