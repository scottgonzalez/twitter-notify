var TwitterNotify = require( "./lib/TwitterNotify" );

TwitterNotify.init();

// add any additional command line args as search terms
process.argv.splice( 2 ).forEach( TwitterNotify.addSearch );

// listen to stdin
process.stdio.open();
process.stdio.addListener( "data", function( input ) {
	TwitterNotify.addSearch( input.trim() );
});
