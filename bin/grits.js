#!/usr/bin/env node

// Deps
var path = require("path");
var _ = require("lodash");

// Load grits package.json
var pkg = require( path.join(__dirname, "../package.json") );

// Parse command line options
var program = require('commander');
program
	.version(pkg.version)
	.usage("[options] [root]")
	.option("-c, --config <path>", 			"The configuration file to use for grits execution")
	.option("    --helpers <path>", 		"Path to Dust.js helpers. (Allows Multiple)", collect)
	.option("    --handlers <path>", 		"Path to Dust.js handlers. (Allows Multiple)", collect)
	.option("    --filters <path>", 		"Path to Dust.js filters. (Allows Multiple)", collect)
	.option("    --partials <path>", 		"Path to Dust.js partials. (Allows Multiple)", collect)
	.option("    --layouts <path>", 		"Path to Dust.js layouts. (Allows Multiple)", collect)
	.option("    --default-layout <name>", 	"Sets the default layout for all content files" )
	.option("    --content <path>", 		"Path to site content. (Allows Multiple)", collect)
	.option("    --static <path>", 			"Path to static content. (Allows Multiple)", collect)
	.option("    --data <path>", 			"Path to data files. (Allows Multiple)", collect)
	.option("    --sass <path>", 			"Path to SASS/SCSS source files. (Allows Multiple)", collect)
	.option("    --sassi <path>", 			"Path to SASS/SCSS include files. (Allows Multiple)", collect)
	.option("-o, --output <path>", 			"Render output path. (Allows Multiple)", collect)
	.option("-p, --plugin <name>", 			"Load a grits plugin. (Allows Multiple)", collect)
	.option("-x, --clean", 					"Instructs the renderer to clean the output path before rendering")
	.option("-n, --noroot", 				"Disable the 'root path' logic and automatic directories")
	.option("-w, --preview", 				"Outputs the grits configuration settings and skips rendering")
	.option("-W, --watch", 					"Enables the watcher; output will refresh after source updates")
	.option("-S, --serve", 					"Enables the LiveReloadX server")
	.option("-P, --port <port>", 			"Sets the port for the LiveReloadX server", function(val){ return parseInt(val, 10); })
	.option("-q, --quiet", 					"Disables ALL log output, alias for '-L none'")
	.option("-v, --verbose", 				"Enables verbose output, alias for '-L debug'")
	.option("-L, --log-level <level>", 		"Sets the minimum log level (trace, debug, info, warn, error, fatal)")
	.option("-f, --log-format <format>", 	"Sets the log format (console, json)")
	.option("-l, --log-filter <str>",		"Limits the output log to only *topics* containing 'str'. (Allows Multiple)", collect)
	.parse(process.argv);



// ---- Configuration Building -------------------------------------------------




// Initialize a grits config object
var gritsConfig = { paths: {}, serve: { enabled: false } };



// Process 'root path' config, which is provided at the end of the command string..
// e.g. grits ./		<-- 1 root, "./"
// e.g. grits /a /b		<-- 2 roots, "/a" and "/b"
// e.g. grits			<-- 0 roots, will default to process.cwd()
var rootDirs = program.args;
var cwd = process.cwd();
if( rootDirs.length === 0 ) {
	rootDirs = [ cwd ];
} else {
	_.each( rootDirs, function( rootDir, rdIndex ) {
		rootDirs[ rdIndex ] = path.resolve( cwd, rootDir );
	});
}
gritsConfig.paths.root = rootDirs;


// Process the 'noroot' setting
if( program.noroot !== undefined ) {
	delete gritsConfig.paths.root;
}


// Process the 'watch' setting
if( program.watch !== undefined ) {
	gritsConfig.watch = true;
}


// Process the 'serve' setting
if( program.serve !== undefined ) {
	gritsConfig.serve.enabled = true;

	// 'serve' implies 'watch'
	gritsConfig.watch = true;

}


// Process the 'port' setting
if( program.port !== undefined ) {
	var port = parseInt( program.port, 10 );
	if( port > 0 && port < 65500 ) {
		gritsConfig.serve.port = port;
	}

	// 'port' implies 'serve'
	gritsConfig.serve.enabled = true;

	// 'serve' implies 'watch'
	gritsConfig.watch = true;


}



// Log Level
// If logLevel is provided explicitly then we will accept the value
// verbatim.  If it is not provided then we will allow for aliases..
if( program.logLevel !== undefined ) {
	gritsConfig.logLevel = program.logLevel;
} else {

	// Process the 'verbose' alias
	if( program.verbose !== undefined ) {
		gritsConfig.logLevel = "debug";
	}

	// Process the 'quiet' alias
	if( program.quiet !== undefined ) {
		gritsConfig.logLevel = "none";
	}

}



// Process the 'log-format' setting
if( program.logFormat !== undefined ) {
	gritsConfig.logFormat = program.logFormat;
}

// Process the 'log-filter' setting
if( program.logFilter !== undefined ) {
	gritsConfig.logFilter = program.logFilter;
}





// Process the 'default-layout' setting
if( program.defaultLayout !== undefined ) {
	gritsConfig.defaultLayout = program.defaultLayout;
}


// Process the 'config' setting
if( program.config !== undefined ) {
	gritsConfig.configFile = path.resolve( cwd, program.config );
}

// Process the 'clean' setting
if( program.clean !== undefined ) {
	gritsConfig.autoClean = true;
}

// Process the 'plugin' setting
if( program.plugin !== undefined ) {
	gritsConfig.plugins = program.plugin;
}

// Process any output paths
if( program.output !== undefined ) {
	gritsConfig.paths.output = [];
	_.each( program.output, function( outputPath ) {
		var resolved = path.resolve( cwd, outputPath );
		//grits.addOutputPath( resolved );
		gritsConfig.paths.output.push( resolved );
	})
}


// ---- Grits Initialization ---------------------------------------------------



// Initialize a renderer
require( path.join( __dirname, "..", pkg.main ) );
var grits = new Dasix.grits.Renderer( gritsConfig );



// ---- Additional Paths -------------------------------------------------------

var extraPaths = [
	[ "helpers", 	"Helper" 		],
	[ "handlers", 	"Handler" 		],
	[ "filters", 	"Filter" 		],
	[ "partials", 	"Partial" 		],
	[ "layouts", 	"Layout" 		],
	[ "content", 	"Content" 		],
	[ "data", 		"Data"			],
	[ "sass", 		"Sass"			],
	[ "sassi", 		"SassInclude"	],
	[ "static", 	"StaticContent"	]
];

// Process any helper paths
_.each( extraPaths, function( epInfo ) {

	// Resolve a few important variables
	var clSwitch 		= epInfo[0];
	var gritsPathType 	= epInfo[1];
	var gritsAddFn		= "add" + gritsPathType + "Path";

	// Check for command line switches for this path type
	if( program[ clSwitch ] !== undefined ) {

		// Iterate over each path
		_.each( program[ clSwitch ], function( targetPath ) {

			// Resolve the path to the current working directory
			var resolved = path.resolve( cwd, targetPath );

			// Add the path
			grits[ gritsAddFn ]( resolved );

		})

	}

});


// ---- Rendering --------------------------------------------------------------


if( program.preview !== undefined ) {

	console.log(" ");
	console.log(" ");
	console.log("Dumping Grits Config:");
	console.log(" ");
	console.log( grits.getConfig() );
	console.log(" ");
	console.log(" ");

} else {

	grits.render().then(

		function() {

			if( grits.reloadServer.$$online === false && grits.watchManager.$$watching === false ) {
				console.log("");
				console.log("Grits Render Complete!");
				console.log("");
			}

			/** debugging methods for stray timers and i/o **/
			//console.log( process._getActiveRequests() );
			//console.log( process._getActiveHandles() );

		}

	)

}




// ---- Commander Helpers ------------------------------------------------------

/**
 * Facilitates value collections (allows the same command line argument to
 * be passed in multiple times), i.e. params with array values
 *
 * @param {string} newVal The new value
 * @param {?string[]} values The existing values
 * @returns {string[]} The value collection
 */
function collect(newVal, values) {

	// Init values, if necessary
	if( values === undefined ) {
		values = [];
	}

	// Add the value
	values.push(newVal);

	// Done
	return values;

}
