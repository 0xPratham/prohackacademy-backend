// creating this file for connectivity
// i choose this name because no one guess this name but they guess db_conn.js that's why i use this name

const dotenv = require('dotenv');
const path = require('path')
// path for config.env file
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const mongoose = require('mongoose');
const mongoURL = process.env.DATABASEURL;
const database_name = process.env.DATABASENAME;

// connect with mongodb atlas and export that function
const mongodb_connect = async () => {
  try {
    await mongoose.connect(`${mongoURL}/${database_name}`, {
      "auth": {
        "username": process.env.DATABASE_USERNAME,
        "password": process.env.DATABASE_PASSWORD
      },
      "authSource": "admin",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🥭 Connected To MongoDB SuccessFully');
  } catch (error) {
    console.log(error);
    console.log("Can't Connect To MongoDB");
  }
};

module.exports = mongodb_connect;