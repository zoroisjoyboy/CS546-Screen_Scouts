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
      throw new Error; "Rethrow the error after logging in"
    }
  }

    return _col;
  };
};

export const movies = getCollectionFn('movies');
export const shows = getCollectionFn('shows');
