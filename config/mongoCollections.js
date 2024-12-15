import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      try { 
        const db = await dbConnection();
        _col = await db.collection(collection);
    } catch (error) {
      console.error("Could not connect to the database:", error);
      throw new Error("Error connecting to the database");
    }
  }

    return _col;
  };
};

export const movies = getCollectionFn('movies');
export const shows = getCollectionFn('shows');
export const users = getCollectionFn('users');
export const reviews = getCollectionFn('reviews');
export const ratings = getCollectionFn('ratings');
export const comments = getCollectionFn('comments');
