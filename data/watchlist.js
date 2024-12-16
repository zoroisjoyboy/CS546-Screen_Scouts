import { ObjectId } from 'mongodb';
import {shows} from '../config/mongoCollections.js';
import {movies} from '../config/mongoCollections.js';
import {users} from '../config/mongoCollections.js';
import axios from 'axios';


const mediaKey = '59aac710b6daa17177d2087697f25bd7';

export const addToWatchlist = async (userId, mediaId, type) => {
  if (!ObjectId.isValid(userId)) throw 'Invalid userId';
  if (!mediaId) throw 'Invalid mediaId'; 

  const usersCollection = await users();

  // get the user
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) throw `User with ID '${userId}' does not exist.`;

  // Check if the media item already exists in the user's watchlist
  const alreadyExists = user.watchlist.some(
    (item) => item.mediaId.toString() === mediaId && item.type === type
  );

  if (alreadyExists) {
    console.log('Media already exists in the watchlist.');
    return false;
  }

  // get media details from the api
  let mediaDetails;
  try {
    const endpoint =
      type === 'movie'
        ? `https://api.themoviedb.org/3/movie/${mediaId}`
        : `https://api.themoviedb.org/3/tv/${mediaId}`;

    const response = await axios.get(endpoint, {
      params: { api_key: mediaKey },
    });

    mediaDetails = response.data;
  } catch (error) {
    console.error(`Error fetching media details from TMDb: ${error}`);
    throw new Error(`Failed to fetch media details for ID '${mediaId}' of type '${type}'.`);
  }

  if (!mediaDetails) {
    throw new Error(`Media with ID '${mediaId}' of type '${type}' does not exist.`);
  }

  // add media to the user's watchlist
  const updateResult = await usersCollection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $addToSet: {
        watchlist: {
          mediaId, 
          type,
          title: mediaDetails.title || mediaDetails.name,
          posterPath: mediaDetails.poster_path,
        },
      },
    }
  );

  //see if the media was added 
  if (updateResult.modifiedCount > 0) {
    console.log('Media added to watchlist:', mediaDetails.title || mediaDetails.name);
    return true;
  }

  return false;
};

export const getWatchlist = async (userId) => {
  if (!ObjectId.isValid(userId)) throw 'Invalid user ID';

  const usersCollection = await users();
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  if (!user || !user.watchlist) return [];

  //return the list
  return user.watchlist.map((item) => ({
    id: item.mediaId, 
    type: item.type,
    title: item.title,
    posterPath: item.posterPath,
  }));
};


export const getWatchedList = async (userId) => {
  if (!ObjectId.isValid(userId)) throw 'Invalid user ID';

  const usersCollection = await users();
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  if (!user || !user.watched || user.watched.length === 0) return [];

  const watchedDetails = [];

  for (const item of user.watched) {
    try {
      const endpoint =
        item.type === 'movie'
          ? `https://api.themoviedb.org/3/movie/${item.mediaId}`
          : `https://api.themoviedb.org/3/tv/${item.mediaId}`;

      const response = await axios.get(endpoint, {
        params: { api_key: '59aac710b6daa17177d2087697f25bd7' },
      });

      if (response.data) {
        watchedDetails.push({
          id: item.mediaId, 
          type: item.type,
          title: response.data.title || response.data.name,
          posterPath: response.data.poster_path,
        });
      }
    } catch (error) {
      console.error(`Error fetching details for mediaId ${item.mediaId}:`, error);
    }
  }
  return watchedDetails;
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
  const apiKey = '59aac710b6daa17177d2087697f25bd7'; 
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
      return null; 
    }
  } catch (e) {
    console.error(`Error getting movie/show details from TMDB: ${e}`);
    throw new Error('Failed to get movie/show details');
  }
};
