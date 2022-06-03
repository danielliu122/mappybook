require("dotenv").config();
var bodyParser = require('body-parser')


const fs = require('fs');

// Function to get current filenames
// in directory with specific extension
function getFilesInDirectory() {
  console.log("\nFiles present in directory:");
  let files = fs.readdirSync(__dirname);
  files.forEach(file => {
    console.log(file);
  });
}

var express = require("express");
const path = require('path');
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

//app.use(express.static(path.join(__dirname, 'public')));
app.use("/", express.static(__dirname));

// app.get('/', function(req, res){
//   res.send('index.html');
// });

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
app.listen(process.env.PORT || 3000);


var uri = process.env['DB_URL'];


var { MongoClient, FindCursor, Db } = require("mongodb");
const { monitorEventLoopDelay } = require("perf_hooks");
const { json } = require("express/lib/response");
var client = new MongoClient(uri);
var locations = [];

function convert(obj) {
  return Object.keys(obj).map(key => ({
      name: key,
      value: obj[key],
      type: "foo"
  }));
}
// //connect to mongo db
// client.connect();




async function getLocations() {
  try {
    await client.connect();
    var database = client.db('MapAppDatabase');
    // return location data
    var result= await database.collection('Responses2').find().toArray();
    //result = Object.entries(result);
    //result.forEach(function(item){ delete item.id });  

    locations=result;
    //console.log(result );
    //console.log(result.length);

    // write to a new file named 
    fs.writeFile('locations',  JSON.stringify(locations), (err) => {
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


locations= getLocations();

(async () => {
  locations = await getLocations();
  //console.log(locations);
  //console.log("server locations "+locations);
  //let stringLocations= locations.toString();
})


async function postLocation(lat,lng,content) {
  try {
    await client.connect();
    console.log("location in server"+lat+lng+content);

    var database = client.db('MapAppDatabase');
    var Responses = database.collection('Responses2');
    
    
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
    (async () => {
      locations = await getLocations();
      //console.log(locations);
      //console.log("server locations "+locations);
      //let stringLocations= locations.toString();
    })
    getLocations(); 
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
  //client = new MongoClient(uri);
}
//postLocation().catch(console.dir);
