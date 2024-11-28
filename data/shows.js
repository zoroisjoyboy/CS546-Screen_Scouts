import {shows} from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

let exportedMethods = {
    async getAllShows() {
      const showCollection = await shows();
      const showList = await showCollection.find({}).toArray();
      return showList;
    },
    async getShowById(id) {
      //id = validation.checkId(id);
      const showCollection = await shows();
      const show = await showCollection.findOne({_id: new ObjectId(id)});
      if (!show) throw 'Error: User not found';
      return show;
    }    
  };
  
export default exportedMethods;