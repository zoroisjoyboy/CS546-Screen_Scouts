import { movies } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

let exportedMethods = {
    async getAllMovies() {
      const movieCollection = await movies();
      const movieList = await movieCollection.find({}).toArray();
      return movieList;
    },
    async getMovieById(id) {
      //id = validation.checkId(id);
      const movieCollection = await movies();
      const movie = await movieCollection.findOne({_id: new ObjectId(id)});
      if (!movie) throw 'Error: User not found';
      return movie;
    }    
  };

export default exportedMethods;