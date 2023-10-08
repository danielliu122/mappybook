var express = require("express");
const path = require('path');
var app = express();
var bodyParser = require('body-parser')
const fs = require('fs');

require("dotenv").config();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

//app.use(express.static(path.join(__dirname, 'public')));
app.use("/", express.static(__dirname));


app.post('/', function(req, res, next) {
  //console.log(req.body);
  res.send("hello world");
  var location2=JSON.stringify(req.body).toString();
  console.log(location2);

  let l0=location2.replaceAll(/\\/g, '');

  l0=l0.substring(2,l0.length-5);
  console.log("lo "+l0);

  let lat=l0.substring(l0.indexOf("lat")+6,l0.indexOf("lng")-3);
  let lng=l0.substring(l0.indexOf("lng")+7,l0.indexOf("title")-3);

  let title= l0.substring(l0.indexOf("title")+8,l0.indexOf("content")-3);
  let content= l0.substring(l0.indexOf("content")+10,l0.length-2);


  //console.log("location in FINAL"+location2 +typeof location2);
     // write to a new* file named 
     fs.writeFile(path.join(__dirname,'/locations.txt'),  JSON.stringify(locations), (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;

      // success case, the file was saved
      console.log('locations url created!');
    }); 
  //postLocation(lat,lng,title,content);

});

// app.listen(3000, function () {
//   console.log("Server is running on localhost3000");
// });

app.listen(process.env.PORT || 3000);


var uri = process.env['DB_URL'];


var { MongoClient, FindCursor, Db } = require("mongodb");
const { monitorEventLoopDelay } = require("perf_hooks");
const { json } = require("express/lib/response");
var client = new MongoClient(uri);
var locations = [];

// //connect to mongo db
// client.connect();




async function getLocations() {
  try {
    await client.connect();
    var database = client.db('MapAppDatabase');
    // return location data
    var result= await database.collection('Responses').find().toArray();
    //result = Object.entries(result);
    //result.forEach(function(item){ delete item.id });  

    locations=result;
    //console.log(result );
    //console.log(result.length);

    // write to a new* file named 
    fs.writeFile(path.join(__dirname,'/locations.txt'),  JSON.stringify(locations), (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;

      // success case, the file was saved
      console.log('locations url created!');
    });  
    } 
    
    finally {
      // Ensures that the client will close when you finish/error
      //await client.close();
  }
  console.log(locations);
  return locations;
}

async function postLocation(lat,lng,title,content) {
  try {
    await client.connect();
    console.log("location in server"+lat+lng+title+content);

    var database = client.db('MapAppDatabase');
    var Responses = database.collection('Responses3');
    
    
    //Query 
    //var doc = { "lat": 1,  "lng": 2,  "content": 3};
    var toPost =  Responses.insertOne({
      lat: lat,
      lng: lng,
      title: title,
      content: content
    });
    Responses.insertOne(toPost);
    //clear database (not working)
    //Responses.drop();


    //retrieve updated location in database
    locations= await getLocations(); 

    // update client txt for location
    fs.appendFile(path.join(__dirname,'/locations.txt'),  JSON.stringify(toPost), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('added location to txt');
  });  


  //   // update client txt for location
  //   fs.writeFile('locations.txt',  JSON.stringify(locations), (err) => {
  //   // throws an error, you could also catch it here
  //   if (err) throw err;

  //   // success case, the file was saved
  //   console.log('locations url created!');
  // });  

  

  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
  //client = new MongoClient(uri);
}
//postLocation().catch(console.dir);
