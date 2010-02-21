var sys = require( "sys" ),
	http = require( "http" ),
	Growl = require( "./lib/Growl" ).Growl;

var search = "ncjs",
	since = 0;

function getTweets() {
	http.cat("http://search.twitter.com/search.json?q=" + search + "&since_id="+since, function(status, content) {
		JSON.parse( content ).results.forEach(function( tweet ) {
			if ( tweet.id > since) {
				since = tweet.id;
			}
			Growl.notify( "From " + tweet.from_user + ": " + tweet.text );
		});
		setTimeout( getTweets, 10000 );
	});
}

getTweets();
