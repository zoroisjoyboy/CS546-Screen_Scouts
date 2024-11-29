import {shows} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from './validation.js';

let exportedMethods = {
    async getAllShows() {
      const showCollection = await shows();
      const showList = await showCollection.find({}).limit(25).toArray();
      return showList;
    },
    async getShowById(id) {
      id = validation.checkId(id);
      const showCollection = await shows();
      const show = await showCollection.findOne({_id: new ObjectId(id)});
      if (!show) throw 'Error: User not found';
      return [show.overview, show.first_air_date, show.vote_average, show.genres, show.director.name];;
    }    
  };
  
export default exportedMethods;