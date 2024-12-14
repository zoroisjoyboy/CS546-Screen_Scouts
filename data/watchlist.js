import { ObjectId } from 'mongodb';
import {shows} from '../config/mongoCollections.js';
import {movies} from '../config/mongoCollections.js';
import {users} from '../config/mongoCollections.js';
import axios from 'axios';


export const addToWatchlist = async (userId, mediaId, type) => {
  if (!ObjectId.isValid(userId)) throw 'Invalid userId';
  if (!ObjectId.isValid(mediaId)) throw 'Invalid mediaId';

  const usersCollection = await users();
  const moviesCollection = await movies();
  const showsCollection = await shows();

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) throw `User with ID '${userId}' does not exist.`;

 // check if the media item already exists in the user's watchlist
 const alreadyExists = user.watchlist.some(
  (item) => item.mediaId.equals(new ObjectId(mediaId)) && item.type === type
);

if (alreadyExists) {
  console.log('Media already exists in the watchlist.');
  return false; 
}

//get media details from the appropriate collection
let mediaDetails = null;
if (type === 'movie') {
  mediaDetails = await moviesCollection.findOne({ _id: new ObjectId(mediaId) });
} else if (type === 'show') {
  mediaDetails = await showsCollection.findOne({ _id: new ObjectId(mediaId) });
} else {
  throw new Error(`Invalid media type: ${type}`);
}

if (!mediaDetails) {
  throw new Error(`Media with ID '${mediaId}' of type '${type}' does not exist.`);
}

// Add the media item to the user's watchlist
const updateResult = await usersCollection.updateOne(
  { _id: new ObjectId(userId) },
  {
    $addToSet: {
      watchlist: {
        mediaId: new ObjectId(mediaId),
        type,
        title: mediaDetails.title || mediaDetails.name,
        posterPath: mediaDetails.poster_path,
      },
    },
  }
);
//check to see if the the results were added 
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

  const moviesCollection = await movies();
  const showsCollection = await shows();

  const watchlistDetails = [];

  for (const item of user.watchlist) {
      let mediaDetails = null;

      if (item.type === 'movie') {
          mediaDetails = await moviesCollection.findOne({ _id: new ObjectId(item.mediaId) });
      } else if (item.type === 'show') {
          mediaDetails = await showsCollection.findOne({ _id: new ObjectId(item.mediaId) });
      }

      if (mediaDetails) {
          watchlistDetails.push({
              title: mediaDetails.title || mediaDetails.name,
              posterPath: mediaDetails.poster_path, 
          });
      }
  }

  return watchlistDetails;
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
