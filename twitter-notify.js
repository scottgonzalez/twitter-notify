var sys = require( "sys" ),
	http = require( "http" ),
	Growl = require( "./lib/Growl" ).Growl;

var search = "ncjs",
	since = 0;

function getTweets() {
	http.cat("http://search.twitter.com/search.json?q=" + search + "&since_id="+since, function(status, content) {
		var tweets = JSON.parse( content ),
			results = tweets[ "results" ],
			length = results.length;
		for (var i = length - 1; i >= 0; i--) {
			if (results[ i ].id > since) {
				since = results[ i ].id;
			}
			Growl.notify( "From " + results[ i ].from_user + ": " + results[ i ].text );
		}
		setTimeout( getTweets, 10000 );
	});
}

getTweets();
