//get location url call
var locations=[];

function run() {
  
  // Creating Our XMLHttpRequest object 
  var xhr = new XMLHttpRequest();

  // Making our connection  
  var url = '/locations.txt';
  xhr.open("GET", url, true);

  // function execute after request is successful 
  xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
          console.log(this.responseText);
          locations=this.responseText;
          locations=JSON.parse(locations);
          console.log(locations);
      }
  }
  // Sending our request 
  xhr.send(locations);
}
function reqListener() {
  console.log(this.responseText);
}
//get location url call

function postLocation(location){
  console.log("location in client"+ location);
  const req = new XMLHttpRequest();
  req.addEventListener("load", reqListener);
  req.open("POST", "/");
  req.send(location);
}
//------------------------------------------------------------------------

function initAutocomplete() {
  console.log("initializing mapscript...");

  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.468766197642246,  lng: -74.44103887469822, },
    zoom: 5,
    mapTypeId: "roadmap",
  });
  run();
  setTimeout(() => {
    console.log("Delayed for 1 seconds.");
    console.log(locations);
    addlocations(locations,map);
  }, "1000");
  

  console.log(locations);
  addlocations(locations,map);
  

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
  
 // Adds a marker to the map and saves user data.
function addMarker(location, map) {
  var usrInput = prompt("Classify this place with a short name; ex: food (Wendy's), event (), recreation (park)" , "");
  if (usrInput == null){
    // do nothing
     //er.setMap(null);
  }
  else if (usrInput.length>=3 && usrInput.length<=50){ //relevant name
    var usrInput2 = prompt("Write a review, comment, or something about this place (if you want)* *posts lower than 5 characters will not be accepted; ex: food, event, recreation", "");
    if (usrInput2.length>=5 && usrInput2.length<=500){
      // save location to database
      console.log("saving location..."+ location);
      let temp = location.toString().split(",");
      console.log(temp);
      let l1= temp[0].slice(1);
      console.log("l1"+ l1);
      let l2= temp[1].slice(0, temp[1].length - 1);
      var l3  = { "lat": l1,  "lng": l2,  "title": usrInput, "content": usrInput2};
      l3=JSON.stringify(l3);
      console.log(l3 + " "+ typeof l3);

      postLocation(l3);  

      // update locations
      run();
    }
  }

  // Add the marker at the clicked location, and add the next-available label
  // from the array of alphabetical characters.
  var marker = new google.maps.Marker({ 
    draggable: true, 
    position: location,
    label: usrInput,
    map: map,
  });
  marker.addListener('rightclick', function() {
    console.log("marker clicked");
    //marker.setMap(null);
    marker.setVisible(false);
  });
  var infowindow = new google.maps.InfoWindow({
    content:usrInput2
  });

  addMarkerListener(marker, infowindow);
  //end of addmarker
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
  
// add location markers func
        
  function addlocations(locations, map){
    for (let i = 0; i < locations.length; i++) {
      console.log(locations[i]);
      console.log("Adding marker at lat="+ locations[i]["lat"] + ", long=" + locations[i]['lng']);

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i]["lat"], locations[i]['lng']),
        map: map,
        label: locations[i]['title']
      });

      var infowindow = new google.maps.InfoWindow({
        content: locations[i]['content']
      });

      // Now we are inside the closure or scope of this for loop,
      // but we're calling a function that was defined in the global scope.
      addMarkerListener(marker, infowindow);
    }
  }
  window.addEventListener('load', (event) => {
    console.log('page is fully loaded');
    // console.log(locations);
    // addlocations(locations,map);
  });
  
  
  
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

//initAutocomplete();
window.initAutocomplete = initAutocomplete;
