import { npaData } from './npa-data.js';

$(document).ready(function(){
  var geocoder, userLocation, serviceArea, service, distancesFromSite, address, NPAs;
  function initialize() {
    geocoder = new google.maps.Geocoder();
    $('#submit').on('click', function(e){
      e.preventDefault();
      codeAddress();
    });

    const reverseLatLng = (npaPoly) => {
      var newCoords = [];
      for (let theValue=0; theValue<npaPoly[0].length; theValue++) {
        var lat = npaPoly[0][theValue][0];
        var lng = npaPoly[0][theValue][1];
        var coords = new google.maps.LatLng(lng, lat);
        newCoords.push(coords);
      }
      return newCoords;
    }

    const coordsOnly = npaData.features.map(npa => {
      return npa.geometry.coordinates;
    });

    const formattedNPAs = coordsOnly.map(coords => {
      return reverseLatLng(coords);
    });

    NPAs = formattedNPAs.map(npa => {
      return new google.maps.Polygon({ paths: npa });
    });
  }

  function codeAddress() {
    address = ($('#address').val() + " " + $('#address-line2').val() + ", " + $('#city').val() + ", " + $('#state').val() + " " + $('#zip').val());
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        userLocation = results[0].geometry.location;
        compareLocation(userLocation);
        if(typeof(Storage) !== "undefined") {
          // Code for localStorage/sessionStorage.
          localStorage.setItem("address", $('#address').val());
          localStorage.setItem("address-line2", $('#address-line2').val());
          localStorage.setItem("city", $('#city').val());
          localStorage.setItem("state", $('#state').val());
          localStorage.setItem("zip", $('#zip').val());
          localStorage.setItem("country", "USA");
        } else {
          // Sorry! No Web Storage support..
          console.log("Sorry! No Web Storage support");
        }
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  var compareLocation = function(u) {
    for (let i = 0; i < NPAs.length; i++) {
      if (google.maps.geometry.poly.containsLocation(u, NPAs[i])) {
        $('#withinReach').fadeIn();
        $('#enterLocation').hide();
        return;
      } else {
        $('#enterLocation').hide();
        $('#outOfReach').fadeIn();
        return;
      }
    }
  };
  $('.reloadLink').on('click', function(e){
    e.preventDefault();
    $('#withinReach, #outOfReach').hide();
    $('#enterLocation').fadeToggle();
    $('#address').val('');
  });

  initialize();
});
