var http = require( "./lib/http" ),
	QueryString = require( "QueryString" ),
	path = require( "path" ),
	Growl = require( "./lib/growl" ).Growl;

var TwitterNotify = {
	frequency: 10000,
	
	addSearch: function( term ) {
		TwitterNotify.search({ term: term, since: 0 });
	},
	
	search: function( search ) {
		var query = QueryString.stringify({
			q: search.term,
			since_id: search.since
		});
		http.cat( "http://search.twitter.com/search.json?" + query,
			function( status, content ) {
				TwitterNotify.handleSearchResponse( search,
					JSON.parse( content ).results );
			});
	},
	
	handleSearchResponse: function( search, tweets ) {
		tweets.forEach(function( tweet ) {
			if ( tweet.id > search.since) {
				search.since = tweet.id;
			}
			TwitterNotify.notify( tweet );
		});
		setTimeout( TwitterNotify.search, TwitterNotify.frequency, search );
	},
	
	notify: function( tweet ) {
		var url = tweet.profile_image_url,
			ext = url.substr( url.lastIndexOf( "." ) ),
			// TODO:
			// - figure out where we should store files
			// - create directory if it doesn't exist
			// - check if file exists before making an HTTP request
			// - add ability to delete files
			file = "/TwitterNotify/" + tweet.from_user + path.extname( url );
		
		http.writeFile( url, file, "binary", function() {
			Growl.notify( tweet.text, {
				title: tweet.from_user,
				image: file
			});
		});
	}
};

process.stdio.open();
process.stdio.addListener( "data", function( input ) {
	TwitterNotify.addSearch( input.trim() );
});
