import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import fs from 'fs';

async function main() {
    const db = await dbConnection();
    await db.dropDatabase();

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
    } //finally {
       // await closeConnection();
   //}
}

main();