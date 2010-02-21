var http = require( "http" ),
	QueryString = require( "QueryString" ),
	Growl = require( "./lib/Growl" ).Growl;

var TwitterNotify = {
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
		setTimeout( TwitterNotify.search, 10000, search );
	},
	
	notify: function( tweet ) {
		Growl.notify( tweet.text, { title: tweet.from_user } );
	}
};

process.stdio.open();
process.stdio.addListener( "data", function( input ) {
	TwitterNotify.addSearch( input.trim() );
});
