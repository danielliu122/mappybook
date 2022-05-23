// require('dotenv').config();
// const uri= process.env.DB_URL;
const uri = "mongodb+srv://testsubject1:waqr6408b@cluster0.v4vo8.mongodb.net/?retryWrites=true&w=majority";
console.log(uri);
// //console.log(process.env); // remove this after you've confirmed it working


const { MongoClient } = require("mongodb");
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    const database = client.db('MapAppDatabase');
    const Responses = database.collection('Responses');
    // Query for a movie that has the title 'Back to the Future'
    var doc = { "lat": 1,  "lng": 2,  "content": 3};
    var result =  Responses.findOne(doc);
    console.log(result);
  } finally {
    // Ensures that the client will close when you finish/error
    //client.close();
  }
}
run().catch(console.dir);