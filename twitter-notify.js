var http = require( "http" ),
	QueryString = require( "QueryString" ),
	Growl = require( "./lib/Growl" ).Growl;

var search = "ncjs",
	since = 0;

function getTweets() {
	var query = QueryString.stringify({
		q: search,
		since_id: since
	});
	http.cat( "http://search.twitter.com/search.json?" + query, function( status, content ) {
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
