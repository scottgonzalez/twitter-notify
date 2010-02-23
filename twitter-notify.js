var TwitterNotify = require( "./lib/TwitterNotify" );

TwitterNotify.init();

// add any additional command line args as search terms
process.argv.splice( 2 ).forEach( TwitterNotify.addSearch );

// listen to stdin
process.stdio.open();
process.stdio.addListener( "data", function( input ) {
	var command = input.trim();
	switch (command[0]) {
		case "l":
			require("sys").puts( "Current Search Terms:" );
			for (var term in TwitterNotify.searches) {
			    require("sys").puts( "\t"+term );
			}
			break;
		case "-":
			TwitterNotify.removeSearch( command.substring(1) );
			break;
		case "+":
			TwitterNotify.addSearch( command.substring(1) );
			break;
		default:
	}
	
});
