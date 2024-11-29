import { movies } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from './validation.js';

let exportedMethods = {
    async getAllMovies() {
      const movieCollection = await movies();
      const movieList = await movieCollection.find({}).limit(5).toArray();
      return movieList;
    },
    async getMovieById(id) {
      id = validation.checkId(id);
      const movieCollection = await movies();
      const movie = await movieCollection.findOne({_id: new ObjectId(id)});
      if (!movie) throw 'Error: User not found';
      //movie1 = [movie.overview, movie.release_date];
      return [movie.overview, movie.release_date, movie.vote_average, movie.genres, movie.director.name];
    }    
  };

export default exportedMethods;