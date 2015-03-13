function Location(name, lat, lng) {
    var self = this;
    self.name = name;  // location name
    self.marker = new google.maps.Marker({
             	position: new google.maps.LatLng(lat, lng),
             	map: map,
             	title: name
             	});
    self.infowindow = new google.maps.InfoWindow();  // info window if the marker
    google.maps.event.addListener(self.marker, 'click', function() {
    	// get info from Foursquare API
    	requestFoursquare(self.marker.getPosition().lat(),
    		self.marker.getPosition().lng(), this);
    });


	function requestFoursquare(lat, lng) {
		var foursquare_url = "https://api.foursquare.com/v2/venues/search?";
		var param = {
			v : "20130815",
			limit : 1,
			client_id : "YM5TXRGFNJVXF4UHOGZRVR24LLUFRCHGDPJMJNH50D2YYOY3",
			client_secret : "1CGCXPWCOHXJQVYITTPOFMSEMGH2UMC2MLNQTERWPXP5FLF3",
			ll : lat + ',' + lng
		};
		$.getJSON(foursquare_url, param, function(json) {
			var placename = json.response.venues[0].name;
			var url = json.response.venues[0].url;
			if (url) {
				var content = '<a href="' + url + '">' + placename + '</a>';
			} else {
				var content = placename;
			}
			self.infowindow.setContent(content);
			self.infowindow.open(map, self.marker);
		});
	};
};

// Overall viewmodel for this screen, along with initial state
function LocationViewModel() {
    var self = this;
    self.filterText = ko.observable('');
    self.key_favorites = ko.observableArray([
        new Location("Kanagawa", 35.529792, 139.698568),
        new Location("Shibuya", 35.664035, 139.698212),
        new Location("Tokyo Tower", 35.65858, 139.745433),
        new Location("Fuji Mountain", 35.360556, 138.727778),
    ]);
    self.filtered_key_favorites = ko.computed(function() {
    	var filter = self.filterText().toLowerCase();
    	if (!filter) {
    		// if the text box was empty, set all list to be visible
    		ko.utils.arrayForEach(self.key_favorites(), function(item) {
    			item.marker.setVisible(true);
    		});
    		return self.key_favorites();
    	} else {
    		return ko.utils.arrayFilter(self.key_favorites(), function(item) {
    			// check if the entered string is in the list
    			if (item.name.toLowerCase().indexOf(filter) !== -1) {
    				item.marker.setVisible(true);
    				return true;
    			} else {
    				item.marker.setVisible(false);
    				// close the window if it was open
    				item.infowindow.close();
    				return false;
    			}
    		})
    	}
    }, self);
};

var map;

function initialize() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(35.529792, 139.698568)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  ko.applyBindings(new LocationViewModel());
};

google.maps.event.addDomListener(window, 'load', initialize);