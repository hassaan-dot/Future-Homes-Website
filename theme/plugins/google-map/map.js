window.marker = null;

function initialize() {
  var map;
  var mapEl = document.getElementById('map');
  var latitude = $(mapEl).attr('data-latitude');
  var longitude = $(mapEl).attr('data-longitude');
  var mapMarker = $(mapEl).attr('data-marker');
  var mapMarkerName = $(mapEl).attr('data-marker-name');
  var addressesJson = $(mapEl).attr('data-addresses');
  var nottingham = latitude && longitude ? new google.maps.LatLng(latitude, longitude) : new google.maps.LatLng(31.5204, 74.3587);
  var style = [{
      "featureType": "administrative.locality",
      "elementType": "all",
      "stylers": [{
          "hue": "#2c2e33"
        },
        {
          "saturation": 7
        },
        {
          "lightness": 19
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text",
      "stylers": [{
          "visibility": "on"
        },
        {
          "saturation": "-3"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#282a00"
      }]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [{
          "hue": "#ffffff"
        },
        {
          "saturation": -100
        },
        {
          "lightness": 100
        },
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [{
          "hue": "#ffffff"
        },
        {
          "saturation": -100
        },
        {
          "lightness": 100
        },
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.school",
      "elementType": "geometry.fill",
      "stylers": [{
          "color": "#f39247"
        },
        {
          "saturation": "0"
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{
          "hue": "#ffb600"
        },
        {
          "saturation": "100"
        },
        {
          "lightness": 31
        },
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.stroke",
      "stylers": [{
          "color": "#ffb600"
        },
        {
          "saturation": "0"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels",
      "stylers": [{
          "hue": "#008eff"
        },
        {
          "saturation": -93
        },
        {
          "lightness": 31
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [{
          "visibility": "on"
        },
        {
          "color": "#f3dbc8"
        },
        {
          "saturation": "0"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels",
      "stylers": [{
          "hue": "#bbc0c4"
        },
        {
          "saturation": -93
        },
        {
          "lightness": -2
        },
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.text",
      "stylers": [{
        "visibility": "off"
      }]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{
          "hue": "#e9ebed"
        },
        {
          "saturation": -90
        },
        {
          "lightness": -8
        },
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [{
          "hue": "#e9ebed"
        },
        {
          "saturation": 10
        },
        {
          "lightness": 69
        },
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [{
          "hue": "#e9ebed"
        },
        {
          "saturation": -78
        },
        {
          "lightness": 67
        },
        {
          "visibility": "simplified"
        }
      ]
    }
  ];
  var mapOptions = {
    center: nottingham,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    backgroundColor: "#000",
    zoom: 10,
    panControl: !1,
    zoomControl: !0,
    mapTypeControl: !1,
    scaleControl: !1,
    streetViewControl: !1,
    overviewMapControl: !1,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE
    }
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  var mapType = new google.maps.StyledMapType(style, {
    name: "Grayscale"
  });
  map.mapTypes.set('grey', mapType);
  map.setMapTypeId('grey');
  var geocoder = new google.maps.Geocoder();
  // If data-addresses provided, geocode each and add colored symbol markers
  if (addressesJson) {
    var addresses = [];
    try {
      addresses = JSON.parse(addressesJson);
    } catch (e) {
      // ignore parse error
      addresses = [];
    }
    var bounds = new google.maps.LatLngBounds();
    addresses.forEach(function (item, idx) {
      (function (addrItem) {
        geocoder.geocode({ 'address': addrItem.address }, function (results, status) {
          if (status === google.maps.GeocoderStatus.OK && results[0]) {
            var loc = results[0].geometry.location;
            bounds.extend(loc);
            var color = addrItem.color || '#FF0000';
            var marker = new google.maps.Marker({
              map: map,
              position: loc,
              title: addrItem.title || addrItem.address,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: color,
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#fff'
              }
            });
            var infow = new google.maps.InfoWindow({ content: '<strong>' + (addrItem.title || '') + '</strong><br>' + addrItem.address });
            marker.addListener('click', function () { infow.open(map, marker); });
            // fit when last geocode completes
            if (idx === addresses.length - 1) {
              map.fitBounds(bounds);
            }
          }
        });
      })(item);
    });
  } else {
    var marker_image = mapMarker;
    var pinIcon = new google.maps.MarkerImage(marker_image, null, null, null, new google.maps.Size(46, 40));
    marker = new google.maps.Marker({
      position: nottingham,
      map: map,
      icon: pinIcon,
      title: mapMarkerName
    });
  }
}
var map = document.getElementById('map');
if (map != null) {
  google.maps.event.addDomListener(window, 'load', initialize)
}