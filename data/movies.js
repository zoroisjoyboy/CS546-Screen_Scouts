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
      return [movie.overview, movie.release_date, movie.vote_average, movie.genres];
    },
    async addMovie(overview, release_date, vote_average, genres) {
      overview = validation.checkString(overview, 'overview');
      release_date = validation.checkString(release_date, 'release_date');
      vote_average = validation.checkString(vote_average, 'vote_average');
      genres = validation.checkString(genres, 'genres');
           
      
      let newMovie = {
        overview: overview,
        release_date: release_date,
        vote_average: vote_average,
        genres: genres
      };

      const movieCollection = await movies();
      const newInsertInformation = await movieCollection.insertOne(newMovie);
      if (!newInsertInformation.insertedId) throw 'Error: Insert failed!';
  
      return await this.getMovieById(newInsertInformation.insertedId.toString());
    }   
  };

export default exportedMethods;