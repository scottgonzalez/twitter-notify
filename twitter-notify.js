var TwitterNotify = require( "./lib/TwitterNotify" );

TwitterNotify.init();

// listen to stdin
process.stdio.open();
process.stdio.addListener( "data", function( input ) {
	TwitterNotify.addSearch( input.trim() );
});
