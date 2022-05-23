// const express = require("express");
// const app = express();
// const path = require('path');



// app.use(express.static(path.join(__dirname, '/main')));


// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/index.html");
// });

// app.listen(3000, function () {
//   console.log("Server is running on localhost3000");
// });



require('dotenv').config();
const uri= process.env.DB_URL;


const { MongoClient, FindCursor } = require("mongodb");
const client = new MongoClient(uri);
var Responses = [];

async function getLocations() {
  try {
    await client.connect();
    const database = client.db('MapAppDatabase');
    // return location data
    // result=database.collection('Responses').findOne().toArray((err, result) => {
    // console.log("retrieved resposes:");
    // //console.log(result);
    // })
    var result= await database.collection('Responses').find().toArray();
    //console.log(result);
    var tempData= [];

    result.forEach(singleResponse => {
      for (let item in singleResponse) {
          //console.log(`${item}: ${singleResponse[item]}`);
          if (item == 'lat' || item == 'lng'){
            //
            tempData.push(item, singleResponse[item]);
          }
          if (item== 'content'){
            tempData.push(item, singleResponse[item]);
            Responses.push(tempData);
            tempData=[];
          }
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
  //console.log(Responses);
  return Responses;
}
//console.log(Responses);

;(async () => {
  Responses = await getLocations()
  //console.log(Responses)
})()

var locations = getLocations();

async function postLocation(location) {
  try {
    await client.connect();
    //const database = client.db('MapAppDatabase');
    //const Responses = database.collection('Responses').find();
    
    // Query 
    //var doc = { "lat": 1,  "lng": 2,  "content": 3};
    //var result =  movies.insertOne(doc);
  } finally {
    // Ensures that the client will close when you finish/error
    //client.close();
  }
}
//postLocation().catch(console.dir);


// In the following example, markers appear when the user clicks on the map.
// Each marker is labeled with a single alphabetical character.
const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
let labelIndex = 0;


// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.
// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">

function initAutocomplete() {
   console.log("initializing map...");
   locations= getLocations();
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.468766197642246,  lng: -74.44103887469822, },
    zoom: 13,
    mapTypeId: "roadmap",
  });
  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  
  
  
  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  let markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        })
      );
      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
  
  // This event listener calls addMarker() when the map is clicked.
  google.maps.event.addListener(map, "click", (event) => {
    //addMarker(event.latLng, map);
  });
  
  
 // Adds a marker to the map and saves user data.
function addMarker(location, map) {
  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.
  var marker = new google.maps.Marker({ 
    draggable: true, 
    position: location,
    label: labels[labelIndex++ % labels.length],
    map: map,
  });
     marker.addListener('rightclick', function() {
    console.log("marker clicked");
    //marker.setMap(null);
    marker.setVisible(false);
  });
  var usrInput = prompt("Write something about this place. (if you want)", "");
  if (usrInput == null){
     marker.setMap(null);
  }
  else if (usrInput.length>0){ //relevant post
    // save location to database
    console.log("saving location..."+ location);
    let temp = location.toString().split(",");
    let l1= temp[0].slice(1);
    console.log("l1"+ l1);
    let l2= temp[1].slice(0, temp[1].length - 1);
    var l3  = { "lat": l1,  "lng": l2,  "content": usrInput};
    postLocation(l3).catch(console.dir);    
  }
  else{
      marker.setMap(null);
      infowindow.close();
  }
     var infowindow = new google.maps.InfoWindow({
            content:usrInput
          });
  addMarkerListener(marker, infowindow);
  
  
}
  
// longCLick function (to add marker)
function LongClick(map, length) {
  this.length_ = length;
  var me = this;
  me.map_ = map;
  me.timeoutId_ = null;
  google.maps.event.addListener(map, 'mousedown', function(e) {
    me.onMouseDown_(e);
  });
  google.maps.event.addListener(map, 'mouseup', function(e) {
    me.onMouseUp_(e);
  });
  google.maps.event.addListener(map, 'drag', function(e) {
    me.onMapDrag_(e);
  });
};
LongClick.prototype.onMouseUp_ = function(e) {
  clearTimeout(this.timeoutId_);
};
LongClick.prototype.onMouseDown_ = function(e) {
  clearTimeout(this.timeoutId_);
  var map = this.map_;
  var event = e;
  this.timeoutId_ = setTimeout(function() {
    google.maps.event.trigger(map, 'LongClick', event);
  }, this.length_);
};
LongClick.prototype.onMapDrag_ = function(e) {
  clearTimeout(this.timeoutId_);
};
  
new LongClick(map, 400);
google.maps.event.addListener(map, 'LongClick', function(event) {
  // add marker on long click
    addMarker(event.latLng, map);
});
  
 // Array that stores the locations and the content about each location
        // var locations = [
        //   {lat: 40.468766197642246,  lng: -74.44103887469822,  content: "<p>First.</p>"},
        // ]

        //Use the first location as the center

        // var mapOptions = {
        //   center: new google.maps.LatLng(locations[0]['lat'],locations[0]['lng']),
        //   zoom: 5,
        //   zoomControl: true,  
        // }

        // var mapElement = document.getElementById('map');

        // add location markers
        for (i = 0; i < Responses.length; i++) {
          console.log("Adding marker at lat="+ Responses[i]['lat'] + ", long=" + Responses[i]['lng']);

          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(Responses[i]['lat'], Responses[i]['lng']),
            map: map,
          });

          var infowindow = new google.maps.InfoWindow({
            content: Responses[i]['content']
          });

          // Now we are inside the closure or scope of this for loop,
          // but we're calling a function that was defined in the global scope.
          addMarkerListener(marker, infowindow);
        }
  
  
function addMarkerListener(marker, infowindow) {

        marker.addListener('mouseover', function(e) {
          infowindow.open(map,marker);
        });

        marker.addListener('mouseout', function() {        
          infowindow.close();
        });
  // hide marker
   marker.addListener('rightclick', function() {
    console.log("marker clicked");
    //marker.setMap(null);
    
    marker.setVisible(false);
    infowindow.close();
  });
  
      } 
  
  
  
// end
}



//window.initAutocomplete = initAutocomplete;
global.initAutocomplete = initAutocomplete;
