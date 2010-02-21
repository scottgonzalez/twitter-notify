var http = require( "./lib/http" ),
	QueryString = require( "QueryString" ),
	fs = require( "fs" ),
	path = require( "path" ),
	Growl = require( "./lib/growl" ).Growl;

// TODO: figure out where we should store files
var dataDir = "/TwitterNotify",
	cacheDuration = 24 * 60 * 60 * 1000;

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
			TwitterNotify.handleTweet( tweet );
		});
		setTimeout( TwitterNotify.search, TwitterNotify.frequency, search );
	},
	
	handleTweet: function( tweet ) {
		var url = tweet.profile_image_url,
		ext = path.extname( url ).toLowerCase(),
		file = dataDir + "/" + tweet.from_user + ext;
	
		fs.stat( file, function( err, info ) {
			if ( err || ( new Date() - new Date(info.mtime) ) > cacheDuration ) {
				http.writeFile( url, file, "binary", function() {
					TwitterNotify.notify( tweet.text, tweet.from_user, file );
				});
			} else {
				TwitterNotify.notify( tweet.text, tweet.from_user, file );
			}
		});
	},
	
	notify: function( msg, user, img ) {
		Growl.notify( msg, {
			title: user,
			image: img
		});
	}
};

TwitterNotify.init();
