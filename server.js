require("dotenv").config();
var bodyParser = require('body-parser')


const fs = require('fs');


const express = require("express");
const path = require('path');
var app = express();



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

app.use("/", express.static(path.join (__dirname, 'public')));
app.get('/locations', function(req, res){
  res.send(locations);
});
app.post('/test', function(req, res, next) {
  // req.body contains the parsed xml 
  //console.log(res.body);
  //cannot use location as microsoft var
  console.log(req.body);
  var location2=JSON.stringify(req.body).toString();
  console.log(location2);

  let toReplace= '\'';
  let l0=location2.replaceAll(/\\/g, '');

  l0=l0.substring(2,l0.length-5);
  console.log("lo "+l0);

  let lat=l0.substring(l0.indexOf("lat")+6,l0.indexOf("lng")-3);
  let lng=l0.substring(l0.indexOf("lng")+7,l0.indexOf("content")-3);;
  let content= l0.substring(l0.indexOf("content")+10,l0.length-2);



  //console.log("location in FINAL"+location2 +typeof location2);
  postLocation(lat,lng,content);

});

// app.listen(3000, function () {
//   console.log("Server is running on localhost3000");
// });

const PORT = process.env.PORT || 5000  // Fall back to port 5000 if process.env.PORT is not set

express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


const uri = process.env['DB_URL'];


const { MongoClient, FindCursor, Db } = require("mongodb");
const { monitorEventLoopDelay } = require("perf_hooks");
const { json } = require("express/lib/response");
const client = new MongoClient(uri);
var locations = [];

function convert(obj) {
  return Object.keys(obj).map(key => ({
      name: key,
      value: obj[key],
      type: "foo"
  }));
}



async function getLocations() {
  try {
    await client.connect();
    const database = client.db('MapAppDatabase');
    // return location data
    var result= await database.collection('Responses').find().toArray();
    //result = Object.entries(result);
    //result.forEach(function(item){ delete item.id });  

    locations=result;
    //console.log(result );
    //console.log(result.length);
    } finally {
      // Ensures that the client will close when you finish/error
      //await client.close();
  }
  console.log(locations);
  return locations;
}


//getLocations();

;(async () => {
  locations = await getLocations();
  //console.log(locations);
  //console.log("server locations "+locations);
  //let stringLocations= locations.toString();

// write to a new file named 
fs.writeFile('./public/locations.txt',  JSON.stringify(locations), (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('locations url created!');
});
})()


async function postLocation(lat,lng,content) {
  try {
    await client.connect();
    console.log("location in server"+lat+lng+content);

    const database = client.db('MapAppDatabase');
    const Responses = database.collection('Responses');
    
    
    //Query 
    //var doc = { "lat": 1,  "lng": 2,  "content": 3};
    var toPost =  Responses.insertOne({
      lat: lat,
      lng: lng,
      content: content
    });
    Responses.insertOne(toPost);
    //clear database (not working)
    //Responses.drop();
  } finally {
    // Ensures that the client will close when you finish/error
   // client.close();
  }
}
//postLocation().catch(console.dir);
