import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

export const movies = getCollectionFn('movies');
export const shows = getCollectionFn('shows');
export const users = getCollectionFn('users');
<<<<<<< HEAD
export const reviews = getCollectionFn('reviews');
export const ratings = getCollectionFn('ratings');
=======
>>>>>>> f2f54d721147a10c7b150dd301447674cdb954aa
