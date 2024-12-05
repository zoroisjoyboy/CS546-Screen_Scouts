import express from 'express';
import { addToWatchlist, getWatchlist} from './data.js';
import { ObjectId } from 'mongodb';
import { dbConnection } from './config/mongoConnection.js';
import screenscoutRoutes from './routes/screenscouts.js';


const app = express();

app.use(express.json());

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
  });

  // const createUser = async () => {
  //   try {
  //     const db = await dbConnection(); // Connect to your MongoDB database
  //     const usersCollection = await db.collection('users'); // Get the users collection
  
  //     const newUser = {
  //       _id: new ObjectId(), // Generate a new ObjectId
  //       name: 'Test User',
  //       email: 'testuser@example.com',
  //       watchlist: [], // Initialize with an empty watchlist
  //     };
  
  //     const result = await usersCollection.insertOne(newUser);
  //     console.log('User created with ID:', result.insertedId);
  
  //     return result.insertedId; // Return the created userId
  //   } catch (error) {
  //     console.error('Error creating user:', error);
  //   }
  // };
  
  // createUser();

  // const testFunctions = async () => {
  //   try {
  //     // Test adding to the watchlist
  //     // console.log('Testing addToWatchlist');
  //     const addResult = await addToWatchlist('674cfff916e5b71295460ef8', '674bc0f05e7275d29c82c80f', 'movie');
  //     console.log('addToWatchlist Result:', addResult);

  //     const addanotherResult = await addToWatchlist('674cfff916e5b71295460ef8', '674bc0f05e7275d29c82c813', 'movie');
  //     console.log('addToWatchlist Result:', addanotherResult);
  
  //     // Test fetching the watchlist
  //     console.log('Testing getWatchlist');
  //     const watchlist = await getWatchlist('674b416d2b19da12dea0be29');
  //     console.log('getWatchlist Result:', watchlist);
  //   } 
  //   catch (error) {
  //     console.error('Test failed with error:', error);
  //   }
  // };
  //   testFunctions();
    
  const testFunctions = async () => {
    try {
      // Test adding to the watchlist
      // console.log('Testing addToWatchlist');
      const addResult = await addToWatchlist('6750f0220e36813d32e141e0', '674bc0f05e7275d29c82c80f', 'movie');
      console.log('addToWatchlist Result:', addResult);

      const addanotherResult = await addToWatchlist('6750f0220e36813d32e141e0', '674bc0f15e7275d29c82ef21', 'show');
      console.log('addToWatchlist Result:', addanotherResult);
  
      // Test fetching the watchlist
      console.log('Testing getWatchlist');
      const watchlist = await getWatchlist('6750f0220e36813d32e141e0');
      console.log('getWatchlist Result:', watchlist);
    } 
    catch (error) {
      console.error('Test failed with error:', error);
    }
  };
    testFunctions();