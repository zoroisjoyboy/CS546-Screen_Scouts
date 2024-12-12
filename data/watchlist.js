import { ObjectId } from 'mongodb';
import {shows} from '../config/mongoCollections.js';
import {movies} from '../config/mongoCollections.js';
import {users} from '../config/mongoCollections.js';


// export const addToWatchlist = async (userId, mediaId, type) => {
//     if (!ObjectId.isValid(userId) || !ObjectId.isValid(mediaId)) throw 'Invalid ID';

//     console.log('Starting addToWatchlist...');
//     console.log('Input data:', { userId, mediaId, type });
  
//     // Validate IDs
//     if (!ObjectId.isValid(userId)) throw `Invalid userId: ${userId}`;
//     if (!ObjectId.isValid(mediaId)) throw `Invalid mediaId: ${mediaId}`;
//     console.log('Validated IDs:', { userId, mediaId });
  
  
//     const usersCollection = await users();
//     let mediaExists = false;
  
//     if (type === 'movie') {
//       const moviesCollection = await movies();
//       mediaExists = await moviesCollection.findOne({ _id: new ObjectId (mediaId) });
//       console.log('Movie found:', mediaExists);
//     } 
//     else if (type === 'show') {
//       const showsCollection = await shows();
//       mediaExists = await showsCollection.findOne({ _id: new ObjectId (mediaId) });
//       console.log('Show found:', mediaExists);
//     }
  
//     if (!mediaExists) throw `media of type '${type}' with ID '${mediaId}' does not exist.`;

//       // Check if the user exists and fetch their watchlist
//   const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
//   console.log('Got user:', user);
//   if (!user) throw `User with ID '${userId}' does not exist.`; 

//    // Ensure `watchlist` exists
//    if (!Array.isArray(user.watchlist)) {
//     console.log('Watchlist does not exist. Initializing as an empty array...');
//     user.watchlist = [];
//   }

//   let alreadyExists = false;
//   for (const item of user.watchlist) {
//     if (item.mediaId.equals(new ObjectId(mediaId)) && item.type === type) {
//       alreadyExists = true;
//       break;
//     }
//   }

//   if (alreadyExists) {
//     console.log('Media already exists in the watchlist.');
//     return false;
//   }
//     console.log('userId:', userId, 'mediaId:', mediaId, 'type:', type);

//     console.log('Adding media to watchlist...');
//     const result = await usersCollection.updateOne(
//    {_id: new ObjectId(userId) },// Match the user
//    {$addToSet: { watchlist: { mediaId: new ObjectId(mediaId), type}}}      
//     );
//     console.log('updateOne result:', result);
  
//     return result.modifiedCount > 0;
//   };
import axios from 'axios';

const mediaKey = '59aac710b6daa17177d2087697f25bd7'; // Replace with your TMDb API key

const getMediaDetails = async (mediaId, type) => {
  try {
    // Determine the correct endpoint based on the type
    let endpoint;
    if (type === 'movie') {
      endpoint = `https://api.themoviedb.org/3/movie/${mediaId}`;
    } else if (type === 'show' || type === 'tv') {
      endpoint = `https://api.themoviedb.org/3/tv/${mediaId}`;
    } else {
      throw `Invalid media type: ${type}`;
    }

    // Fetch media details
    const response = await axios.get(endpoint, {
      params: {
        api_key: mediaKey,
      },
    });

    return response.data; // Return the media details
  } catch (error) {
    console.error(`Error fetching media details: ${error}`);
    return null; // Return null if the media details cannot be fetched
  }
};


export const addToWatchlist = async (userId, mediaId, type) => {
  if (!ObjectId.isValid(userId)) throw 'Invalid userId';
  if (!ObjectId.isValid(mediaId)) throw 'Invalid mediaId';

  const usersCollection = await users();
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  if (!user) throw `User with ID '${userId}' does not exist.`;

  const media = await getMediaDetails(mediaId, type); 

  if (!media) throw `Media with ID '${mediaId}' of type '${type}' does not exist.`;

  let itemTitle;
  if (type === 'movie') {
    itemTitle = media.title;
  } else {
    itemTitle = media.name;
  }
  const item = {
    mediaId: new ObjectId(mediaId),
    type,
    title: itemTitle,
    overview: media.overview,
    poster_path: media.poster_path,
  };
  // see if the item already exists in the user's watchlist
  const alreadyExists = user.watchlist.some(
    (existingItem) =>
      existingItem.mediaId.equals(mediaId) && existingItem.type === type
  );

  if (alreadyExists) {
    console.log('Media already exists in the watchlist.');
    return false; // Explicitly return false for no modification
  }

  // add the item to watchlist
  const updateResult = await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { watchlist: item } }
  );

  return updateResult.modifiedCount > 0;
};


  // export const getWatchlist = async (userId) => {
  //   if (!ObjectId.isValid(userId)) throw 'Invalid user ID';
  
  //   const usersCollection = await users();
  //   const user = await usersCollection.findOne({ userId: new ObjectId(userId) });
  
  //   if (!user || !user.Watchlist) 
  //     return { movies: [], shows: [] };
  
  //   const moviesCollection = await movies();
  //   const showsCollection = await shows();
  
  //   const moviesDetails = [];
  //   const showsDetails = [];
  
  //   // Process each item sequentially
  //   for (const item of user.watchlist) {
  //     if (item.type === 'movie') {
  //       const movie = await moviesCollection.findOne({ _id: new ObjectId (item.mediaId) });
  //       console.log('Got movie:', movie);
  //       if (movie) moviesDetails.push(movie);
  //     } else if (item.type === 'show') {
  //       const show = await showsCollection.findOne({ _id: new ObjectId (item.mediaId) });
  //       console.log('Got show:', show);
  //       if (show) showsDetails.push(show);
  //     }
  //   }
  
  //   return {movies: moviesDetails, shows: showsDetails};
  // };

  export const getWatchlist = async (userId) => {
    if (!ObjectId.isValid(userId)) throw new Error('Invalid user ID');
  
    const usersCollection = await users();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  
    if (!user) throw new Error(`User with ID '${userId}' does not exist.`);
    if (!user.watchlist || user.watchlist.length === 0) return { movies: [], shows: [] };
  
    const movies = [];
    const shows = [];
  
    for (const item of user.watchlist) {
      try {
        const mediaDetails = await getMediaDetails(item.mediaId, item.type);
        if (!mediaDetails) {
          console.warn(`Media with ID '${item.mediaId}' of type '${item.type}' could not be fetched.`);
          continue;
        }
  
        if (item.type === 'movie') {
          movies.push({
            id: item.mediaId,
            title: mediaDetails.title,
            posterPath: mediaDetails.poster_path,
            overview: mediaDetails.overview,
            releaseDate: mediaDetails.release_date,
          });
        } else if (item.type === 'tv') {
          shows.push({
            id: item.mediaId,
            name: mediaDetails.name,
            posterPath: mediaDetails.poster_path,
            overview: mediaDetails.overview,
            firstAirDate: mediaDetails.first_air_date,
          });
        }
      } catch (error) {
        console.error(`Error fetching details for media ID '${item.mediaId}':`, error);
      }
    }
  
    return { movies, shows };
  };
  

  export const searchMoviesByTitle = async (title) => {
    const media_URL = 'https://api.themoviedb.org/3/search/multi';
    const apiKey = '59aac710b6daa17177d2087697f25bd7';
    const resultsPerPage = 20;
    const maxResults = 50;
    let results = [];
  
    try {
      // get results page by page
      for (let page = 1; results.length < maxResults; page++) {
        const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
          params: {
            api_key: apiKey,
            query: title,
            page,
          },
        });
  
        if (response.data && response.data.results) {
          results = results.concat(response.data.results);
  
          // stop if all the results have been recieved
          if (response.data.results.length < resultsPerPage) break;
        } else {
          break;
        }
      }
  
      return results.slice(0, maxResults); 
    } 
    catch (e) {
      console.error(`Error searching TMDB API: ${e}`);
      throw new Error('Failed to get search results');
    }
  };


export const getMovieById = async (id, type = 'movie') => {
  const apiKey = '59aac710b6daa17177d2087697f25bd7'; // TMDB API key
  let endpoint;
  if (type === 'movie') {
    endpoint = `/movie/${id}`;
  } else {
    endpoint = `/tv/${id}`;
  }

  try {
    const response = await axios.get(`https://api.themoviedb.org/3${endpoint}`, {
      params: { api_key: apiKey },
    });

    if (response.data) {
      return response.data;
    } else {
      return null; // No data found
    }
  } catch (e) {
    console.error(`Error getting movie/show details from TMDB: ${e}`);
    throw new Error('Failed to get movie/show details');
  }
};
