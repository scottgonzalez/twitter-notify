var http = require( "./http" ),
	QueryString = require( "QueryString" ),
	fs = require( "fs" ),
	path = require( "path" ),
	Growl = require( "./growl" );

// TODO: figure out where we should store files
// TODO: make these configurable
var dataDir = "/TwitterNotify",
	cacheDuration = 24 * 60 * 60 * 1000,
	frequency = 10000;

var TwitterNotify = process.mixin(exports, {
	searches: {},
	
	init: function() {
		if ( !path.exists( dataDir ) ) {
			fs.mkdir( dataDir, 0750	 );
		}
	},
	
	addSearch: function( term ) {
		TwitterNotify.searches[ term ] = 0;
		TwitterNotify.search( term );
	},
	
	removeSearch: function( term ) {
		delete TwitterNotify.searches[ term ];
	},
	
	search: function( term ) {
		var query = QueryString.stringify({
			q: term,
			since_id: TwitterNotify.searches[ term ]
		});
		http.cat( "http://search.twitter.com/search.json?" + query,
			function( status, content ) {
				TwitterNotify.handleSearchResponse( term,
					JSON.parse( content ).results );
			});
	},
	
	handleSearchResponse: function( term, tweets ) {
		tweets.forEach(function( tweet ) {
			if ( tweet.id > TwitterNotify.searches[ term ] ) {
				TwitterNotify.searches[ term ] = tweet.id;
			}
			TwitterNotify.handleTweet( tweet );
		});
		if ( term in TwitterNotify.searches ) {
			setTimeout( TwitterNotify.search, frequency, term );
		}
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
});
