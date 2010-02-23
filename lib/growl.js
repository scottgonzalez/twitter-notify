var exec = require( "sys" ).exec;

function quote( str ) {
	return '"' + str.replace( /"/g, '"\\""' ) + '"';
}

exports.notify = function( msg, options ) {
	options = process.mixin( { message: msg }, options );
	var cmd = [ "growlnotify" ];
	for (var option in options) {
		cmd.push( "--" + option );
		if ( typeof options[ option ] !== "boolean" ) {
			cmd.push( quote( options[ option ] ) );
		}
	}
	exec( cmd.join( " " ) );
};
