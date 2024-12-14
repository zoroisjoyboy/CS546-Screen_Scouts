import { MongoClient } from 'mongodb';
import { mongoConfig } from './settings.js';

let _connection = undefined;
let _db = undefined;

const dbConnection = async () => {
  if (!_connection) {
    try {
      _connection = await MongoClient.connect(mongoConfig.serverUrl);
      _db = _connection.db(mongoConfig.database);
    } catch (error) {
      console.error("Could not connect to the database:", error);
      throw error; //Rethrow the error after logging in
    }
  }
  return _db;
};

const closeConnection = async () => {
  if (_connection) {
    await _connection.close();
    _connection = undefined; //Reset the connection 
    _db = undefined; //Reset the database
  }
};

export { dbConnection, closeConnection };