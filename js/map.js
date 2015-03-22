"use strict";

// marker info window
var infowindow = new google.maps.InfoWindow();
google.maps.event.addListener(infowindow, 'closeclick', function() {
    // deactivate all list item
    for (var i = 0; i < location_list.length; i++) {
        location_list[i].isActive(false);
    }
});

function Location(name, lat, lng) {
    var self = this;
    // name of the location
    self.name = name;

    // when clicked, changed the css class to active
    self.isActive = ko.observable(false);

    self.marker = new google.maps.Marker({
             	position: new google.maps.LatLng(lat, lng),
             	map: map,
             	title: name
             	});
    google.maps.event.addListener(self.marker, 'click', function() {
        // deactivate all list item
        for (var i = 0; i < location_list.length; i++) {
            location_list[i].isActive(false);
        }

    	// get info from Foursquare API
    	requestFoursquare(self.marker.getPosition().lat(),
    		self.marker.getPosition().lng(), this);
        self.isActive(true);
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
            var venue = json.response.venues[0];
			var placename = venue.name;
			var url = venue.url;
            var here_now = venue.hereNow.count;
            var checkin_count = venue.stats.checkinsCount;
            var address = venue.location.address;

            // string to add in info window
            var content = '';
			if (url) {
				content += '<a href="' + url + '">' + placename + '</a>';
			} else {
				content += placename;
			}
            if (address)
                content += '<br>address: ' + address;
            if (here_now)
                content += '<br>Here Now: ' + here_now;
            if (checkin_count)
                content += '<br>Checkin count: ' + checkin_count;
			infowindow.setContent(content);
			infowindow.open(map, self.marker);
		})
        // error handling
        .error(function(jqXHR, textStatus, errorThrown) {
            console.log("error: " + textStatus);
            console.log(jqXHR.responseText);
            infowindow.setContent('Could not find info of this location');
			infowindow.open(map, self.marker);
        });
	}
}

var location_list;

// Overall viewmodel for this screen, along with initial state
function LocationViewModel() {
    var self = this;
    self.filterText = ko.observable('');
    location_list = [
        new Location("Kanagawa", 35.529792, 139.698568),
        new Location("Shibuya", 35.664035, 139.698212),
        new Location("Tokyo Tower", 35.65858, 139.745433),
        new Location("Fuji Mountain", 35.360556, 138.727778),
    ];
    self.key_favorites = ko.observableArray(location_list);
    self.filtered_key_favorites = ko.computed(function() {
    	var filter = self.filterText().toLowerCase();

        // close infowindow, deactivate all list
        infowindow.close();
        ko.utils.arrayForEach(self.key_favorites(), function(item) {
            item.isActive(false);
        });

    	if (!filter) {
    		// if the text box was empty, set all list to be visible
    		ko.utils.arrayForEach(self.key_favorites(), function(item) {
    			item.marker.setVisible(true);
    		});
    		return self.key_favorites();
    	} else {
            // if text box had some text
    		return ko.utils.arrayFilter(self.key_favorites(), function(item) {
    			// check if the entered string is in the list
    			if (item.name.toLowerCase().indexOf(filter) !== -1) {
    				item.marker.setVisible(true);
    				return true;
    			} else {
    				item.marker.setVisible(false);
    				return false;
    			}
    		});
    	}
    }, self);


    self.locationSelected = function() {
        google.maps.event.trigger(this.marker, 'click');

        // when clicked, remove all active item in list
        for (var i = 0; i < self.key_favorites().length; i++) {
            var loc = self.key_favorites()[i];
            loc.isActive(false);
        }

        this.isActive(!this.isActive());
    };
}

var map;

function initialize() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(35.529792, 139.698568)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  ko.applyBindings(new LocationViewModel());
}

google.maps.event.addDomListener(window, 'load', initialize);