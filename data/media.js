import { movies, shows } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from './validation.js';

let exportedMethods = {
    async getAllMovies() {
      const movieCollection = await movies();
      const movieList = await movieCollection.find({}).limit(15).toArray();
      return movieList;
    },
    async getMovieById(movie_title) {
      //movie_title = validation.checkId(id);
      const movieCollection = await movies();
      const movie_current = await movieCollection.findOne({title: movie_title});
      if (!movie_current) throw 'Error: User not found';
      return movie_current;
    },
    async getAllShows() {
        const showCollection = await shows();
        const showList = await showCollection.find({}).limit(25).toArray();
        return showList;
      },
      async getShowById(show_title) {
        //id = validation.checkId(id);
        const showCollection = await shows();
        const show_current = await showCollection.findOne({name: show_title});
        //return showList;
  
        //const show = await showCollection.findOne({_id: new ObjectId(id)});
        if (!show_current) throw 'Error: Show not found';
        //return [show_current.overview, show_current.first_air_date, show_current.vote_average, show_current.genres];
        return show_current;
      },
      async addMovie(title, overview, vote_average, release_date) {
        overview = validation.checkString(overview, 'overview');
        //release_date = validation.checkString(release_date, 'release_date');
        //vote_average = validation.checkString(vote_average, 'vote_average');
        genres = validation.checkString(genres, 'genres');    
        
        let newMovie = {
          title,
          overview,          
          vote_average,
          release_date
        };
  
        const movieCollection = await movies();
        const newInsertInformation = await movieCollection.insertOne(newMovie);
        if (!newInsertInformation.insertedId) throw 'Error: Insert failed!';
    
        return await this.getMovieById(newInsertInformation.insertedId.toString());
      },   
      async addShow(name, overview, vote_average, first_air_date) {
        overview = validation.checkString(overview, 'overview');
        //release_date = validation.checkString(release_date, 'release_date');
        //vote_average = validation.checkString(vote_average, 'vote_average');
        genres = validation.checkString(genres, 'genres');
             
        const showCollection = await shows();
  
        let newShow = {
          name, 
          overview, 
          vote_average,
          first_air_date,
        };
  
        const newInsertInformation = await showCollection.insertOne(newShow);
        if (!newInsertInformation.insertedCount ===0) throw 'Error: Failed to Insert the Show!';
    
        return await this.getShowById(newInsertInformation.insertedId.toString());
      }  
  };

export default exportedMethods;