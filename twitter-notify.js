var http = require( "http" ),
	QueryString = require( "QueryString" ),
	Growl = require( "./lib/Growl" ).Growl;

function addSearch( term ) {
	getTweets({ term: term, since: 0 });
}

function getTweets( search ) {
	var query = QueryString.stringify({
		q: search.term,
		since_id: search.since
	});
	http.cat( "http://search.twitter.com/search.json?" + query, function( status, content ) {
		JSON.parse( content ).results.forEach(function( tweet ) {
			if ( tweet.id > search.since) {
				search.since = tweet.id;
			}
			Growl.notify( "From " + tweet.from_user + ": " + tweet.text );
		});
		setTimeout( getTweets, 10000, search );
	});
}

process.stdio.open();
process.stdio.addListener( "data", function( input ) {
	addSearch( input.trim() );
});
