var http = require( "./lib/http" ),
	QueryString = require( "QueryString" ),
	fs = require( "fs" ),
	path = require( "path" ),
	Growl = require( "./lib/growl" ).Growl;

// TODO: figure out where we should store files
var dataDir = "/TwitterNotify";

var TwitterNotify = {
	frequency: 10000,
	
	init: function() {
		if ( !path.exists( dataDir ) ) {
			fs.mkdir( dataDir, 0750	 );
		}
		
		process.stdio.open();
		process.stdio.addListener( "data", function( input ) {
			TwitterNotify.addSearch( input.trim() );
		});
	},
	
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
			ext = path.extname( url ).toLowerCase(),
			// TODO:
			// - check if file exists before making an HTTP request
			// - add ability to delete files
			file = dataDir + "/" + tweet.from_user + ext;
		
		http.writeFile( url, file, "binary", function() {
			Growl.notify( tweet.text, {
				title: tweet.from_user,
				image: file
			});
		});
	}
};

TwitterNotify.init();