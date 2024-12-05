import { ObjectId } from 'mongodb';
import {shows} from './config/mongoCollections.js';
import {movies} from './config/mongoCollections.js';
import {users} from './config/mongoCollections.js';



export const addToWatchlist = async (userId, mediaId, type) => {
    if (!ObjectId.isValid(userId) || !ObjectId.isValid(mediaId)) throw 'Invalid ID';

    console.log('Starting addToWatchlist...');
    console.log('Input data:', { userId, mediaId, type });
  
    // Validate IDs
    if (!ObjectId.isValid(userId)) throw `Invalid userId: ${userId}`;
    if (!ObjectId.isValid(mediaId)) throw `Invalid mediaId: ${mediaId}`;
    console.log('Validated IDs:', { userId, mediaId });
  
  
    const usersCollection = await users();
    let mediaExists = false;
  
    if (type === 'movie') {
      const moviesCollection = await movies();
      mediaExists = await moviesCollection.findOne({ _id: new ObjectId (mediaId) });
      console.log('Movie found:', mediaExists);
    } 
    else if (type === 'show') {
      const showsCollection = await shows();
      mediaExists = await showsCollection.findOne({ _id: new ObjectId (mediaId) });
      console.log('Show found:', mediaExists);
    }
  
    if (!mediaExists) throw `media of type '${type}' with ID '${mediaId}' does not exist.`;

      // Check if the user exists and fetch their watchlist
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  console.log('Got user:', user);
  if (!user) throw `User with ID '${userId}' does not exist.`; 

   // Ensure `watchlist` exists
   if (!Array.isArray(user.watchlist)) {
    console.log('Watchlist does not exist. Initializing as an empty array...');
    user.watchlist = [];
  }

    const alreadyExists = user.watchlist.some(
      (item) => item.mediaId.equals(new ObjectId(mediaId)) && media.type === type
    );
    if (alreadyExists) {
      console.log('Media already exists in the watchlist.');
      return false; // Explicitly return false for no modification
    }
  

    console.log('userId:', userId, 'mediaId:', mediaId, 'type:', type);

    console.log('Adding media to watchlist...');
    const result = await usersCollection.updateOne(
   {_id: new ObjectId(userId) },// Match the user
   {$addToSet: { watchlist: { mediaId: new ObjectId(mediaId), type}}}      
    );
    console.log('updateOne result:', result);
  
    return result.modifiedCount > 0;
  };


  export const getWatchlist = async (userId) => {
    if (!ObjectId.isValid(userId)) throw 'Invalid user ID';
  
    const usersCollection = await users();
    const user = await usersCollection.findOne({ userId: new ObjectId(userId) });
  
    if (!user || !user.Watchlist) 
      return { movies: [], shows: [] };
  
    const moviesCollection = await movies();
    const showsCollection = await shows();
  
    const moviesDetails = [];
    const showsDetails = [];
  
    // Process each item sequentially
    for (const item of user.watchlist) {
      if (item.type === 'movie') {
        const movie = await moviesCollection.findOne({ _id: new ObjectId (item.mediaId) });
        console.log('Got movie:', movie);
        if (movie) moviesDetails.push(movie);
      } else if (item.type === 'show') {
        const show = await showsCollection.findOne({ _id: new ObjectId (item.mediaId) });
        console.log('Got show:', show);
        if (show) showsDetails.push(show);
      }
    }
  
    return { movies: moviesDetails, shows: showsDetails };
  };
