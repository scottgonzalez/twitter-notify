var fs = require( "fs" ),
	http = process.mixin( exports, require( "http" ) );

http.writeFile = function( url, path, encoding, callback ) {
	if ( typeof encoding === "function" ) {
		callback = encoding;
		encoding = "utf8";
	}
	encoding = encoding || "utf8";
	http.cat( url, encoding, function( status, content ) {
		fs.writeFile( path, content, encoding, callback );
	});
};
