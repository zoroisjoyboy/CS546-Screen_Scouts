import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import fs from 'fs';

async function main() {
    const db = await dbConnection();
    await db.dropDatabase();

     // create empty collections in mongodb
     try {
        const collectionsToCreate = ['movies', 'shows', 'users', 'reviews', 'ratings', 'comments'];
        for (const collectionName of collectionsToCreate) {
            const collections = await db.listCollections({name: collectionName}).toArray();
            if (collections.length > 0) {
                console.log(`Collection ${collectionName} already exists.`);
            } else {
                await db.createCollection(collectionName);
                console.log(`Collection ${collectionName} successfully created.`);
            }
        }
    } catch (e) {
        console.error('Error occured while creating collections: ', e);
    }

    // insert moviesData.json and showsData.json into mongodb
    try {
        let moviesJsonString = fs.readFileSync('./moviesData.json');;
        let showJsonString = fs.readFileSync('./showsData.json');

        const moviesData = JSON.parse(moviesJsonString);
        const showsData = JSON.parse(showJsonString);

        const moviesCollection = db.collection('movies');
        const showsCollection = db.collection('shows');

        await moviesCollection.insertMany(moviesData);
        await showsCollection.insertMany(showsData);
    
        console.log('Data successfully inserted');

    } catch (e) {
        console.error('Error occured while inserting data: ', e);
    } finally {
        await closeConnection();
    }
}

main();