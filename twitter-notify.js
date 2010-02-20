var sys = require( "sys" ),
	http = require( "http" ),
	Growl = require( "./lib/Growl" ).Growl;

var search = "ncjs";

var connection = http.createClient( 80, "search.twitter.com" ),
	since = 0;

function getTweets() {
	var request = connection.get( "/search.json?q=" + search + "&since_id="+since, {
		host: "search.twitter.com",
		"User-Agent": "NodeJS HTTP Client"
	});
	request.finish(function( response ) {
		var responseBody = "";
		response.setBodyEncoding( "utf8" );
		response.addListener( "body", function(chunk) {
			responseBody += chunk;
		});
		response.addListener( "complete", function() {
			var tweets = JSON.parse( responseBody ),
				results = tweets[ "results" ],
				length = results.length;
			for (var i = length - 1; i >= 0; i--) {
				if (results[ i ].id > since) {
					since = results[ i ].id;
				}
				Growl.notify( "From " + results[ i ].from_user + ": " + results[ i ].text );
			}
		});
	});
	setTimeout( getTweets, 10000 );
}

getTweets();
