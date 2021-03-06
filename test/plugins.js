// Dependencies
var util = require("./lib/util");
var expect  = util.expect;
var _ = util.lodash;

// Settings
var fixtureName = "plugins";

// Tests
describe("Plugins:", function() {

	var rndr;
	var paths;

	describe("Manual Initialization:", function() {

		it("should accept plugin constructor functions", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var froot = paths.fixtureRoot;
			var ppath = util.path.join( froot, "plugins/test-one.js" );

			// Create a renderer
			rndr = util.getFreshRenderer();

			// Load the plugin manually so that we can
			// pass it in as a function..
			var plugin = require( ppath );

			// Pass the plugin to the renderer
			var iplug = rndr.addPlugin( plugin );

			// Check to see if the plugin loaded;
			// (the test plugins modify the renderer a bit to show evidence of their existence).
			expect( rndr.__evidence["test-one"]["constructor"] ).to.equal( true );
			expect( rndr.__evidence["test-one"]["onAttach"]    ).to.equal( true );

			// Expect `iplug` to be our plugin
			expect( iplug ).to.be.an( "array" );
			expect( iplug[0] ).to.be.an( "object" );

		});

		it("should accept file paths", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var froot = paths.fixtureRoot;
			var ppath = util.path.join( froot, "plugins/test-one.js" );

			// Create a renderer
			rndr = util.getFreshRenderer();

			// Pass the plugin path to the renderer
			var iplug = rndr.use( ppath );

			// Check to see if the plugin loaded;
			// (the test plugins modify the renderer a bit to show evidence of their existence).
			expect( rndr.__evidence["test-one"]["constructor"] ).to.equal( true );
			expect( rndr.__evidence["test-one"]["onAttach"]    ).to.equal( true );

			// Expect `iplug` to be our plugin
			expect( iplug ).to.be.an( "array" );
			expect( iplug[0] ).to.be.an( "object" );

		});

		it("should accept arrays", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var froot = paths.fixtureRoot;
			var ppatha = util.path.join( froot, "plugins/test-one.js" );
			var ppathb = util.path.join( froot, "plugins/test-two.js" );

			// Create a renderer
			rndr = util.getFreshRenderer();

			// Load the plugin manually so that we can
			// pass it in as a function..
			var plugina = require( ppatha );

			// Add the plugins
			var iplug = rndr.use( [
				ppathb, plugina
			] );

			// Check to see if the plugin loaded;
			// (the test plugins modify the renderer a bit to show evidence of their existence).
			expect( rndr.__evidence["test-one"]["constructor"] ).to.equal( true );
			expect( rndr.__evidence["test-one"]["onAttach"]    ).to.equal( true );
			expect( rndr.__evidence["test-two"]["constructor"] ).to.equal( true );
			expect( rndr.__evidence["test-two"]["onAttach"]    ).to.equal( true );

			// Expect `iplug` to be our plugin
			expect( iplug ).to.be.an( "array" );
			expect( iplug[0] ).to.be.an( "object" );
			expect( iplug[1] ).to.be.an( "object" );

		});

		it("should properly apply configuration overrides", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var froot = paths.fixtureRoot;
			var ppatha = util.path.join( froot, "plugins/test-one.js" );

			// Create a renderer
			rndr = util.getFreshRenderer({
				settings: {
					d: "global-config"
				}
			});

			// Add the plugins
			var iplug = rndr.use(
				{
					plugin: ppatha,
					a: "base-config",
					b: "base-config"
				},{
					a: "override-config"
				},{
					a: "global-config",
					b: "global-config",
					c: "global-config"
				}
			);

			// Check to see if the plugin loaded;
			// (the test plugins modify the renderer a bit to show evidence of their existence).
			expect( rndr.__evidence["test-one"]["constructor"] ).to.equal( true );
			expect( rndr.__evidence["test-one"]["onAttach"]    ).to.equal( true );

			// Validate the config
			var finalConfig = rndr.pluginManager.getPluginConfig( "test-one" );
			expect( finalConfig.a ).to.equal( "override-config" );
			expect( finalConfig.b ).to.equal( "base-config" );
			expect( finalConfig.c ).to.equal( "global-config" );
			expect( finalConfig.d ).to.equal( "global-config" );

		});

	});

	describe("Constructor Initialization:", function() {

		it("should accept plugins", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var froot = paths.fixtureRoot;
			var ppatha = util.path.join( froot, "plugins/test-one.js" );
			var ppathb = util.path.join( froot, "plugins/test-two.js" );

			// Create a renderer
			rndr = util.getFreshRenderer(
				{
					plugins: [
						ppatha,
						require( ppathb )
					]
				}
			);

			// Check to see if the plugin loaded;
			// (the test plugins modify the renderer a bit to show evidence of their existence).
			expect( rndr.__evidence["test-one"]["constructor"] ).to.equal( true );
			expect( rndr.__evidence["test-one"]["onAttach"]    ).to.equal( true );
			expect( rndr.__evidence["test-two"]["constructor"] ).to.equal( true );
			expect( rndr.__evidence["test-two"]["onAttach"]    ).to.equal( true );

		});

		it("should accept 'plugins' as an object", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var froot = paths.fixtureRoot;
			var ppatha = util.path.join( froot, "plugins/test-one.js" );

			// Init config
			var cfg = {
				plugins: {}
			};

			// Add plugin as object
			cfg.plugins[ ppatha ] = {};

			// Create a renderer
			rndr = util.getFreshRenderer(cfg);

			// Check to see if the plugin loaded;
			// (the test plugins modify the renderer a bit to show evidence of their existence).
			expect( rndr.__evidence["test-one"]["constructor"] ).to.equal( true );
			expect( rndr.__evidence["test-one"]["onAttach"]    ).to.equal( true );

		});

		it("should accept plugin configuration info", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var froot = paths.fixtureRoot;
			var ppatha = util.path.join( froot, "plugins/test-one.js" );

			// Create a renderer
			rndr = util.getFreshRenderer(
				{
					plugins: [
						{
							plugin: ppatha,
							a: 1,
							b: 2,
							c: 3
						}
					]
				}
			);

			// Check to see if the plugin loaded;
			// (the test plugins modify the renderer a bit to show evidence of their existence).
			expect( rndr.__evidence["test-one"]["constructor"] ).to.equal( true );
			expect( rndr.__evidence["test-one"]["onAttach"]    ).to.equal( true );

			// Validate the config
			var finalConfig = rndr.pluginManager.getPluginConfig( "test-one" );
			expect( finalConfig.a ).to.equal( 1 );
			expect( finalConfig.b ).to.equal( 2 );
			expect( finalConfig.c ).to.equal( 3 );

		});

	});

	describe("Rendering Hooks:", function() {

		it("should work properly", function( cb ) {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var froot = paths.fixtureRoot;
			var ppatha = util.path.join( froot, "plugins/test-one.js" );
			var ppathb = util.path.join( froot, "plugins/test-two.js" );

			// Create a renderer
			rndr = util.getFreshRenderer(
				{
					plugins: [
						ppatha,
						require( ppathb )
					],
					paths: {
						root: paths.sourceRoot,
						output: paths.outputRoot
					},
					autoClean: true,
					verbose: false,
					logFilter: "plugin"
				}
			);

			//rndr.setVerbose( true );
			//rndr.setLogFilter( "plugin" );


			// Render
			rndr.render().then(

				function() {

					// Fires 'onDetach'
					rndr.clearPlugins();

					// Ensure all "evidence" is true
					_.each( ["test-one", "test-two"], function( pluginName ) {

						_.each( rndr.__evidence[ pluginName ], function( val, eventName ) {

							if( !val ) {

								throw new Error("Plugin '" + pluginName + "' expected a call to its '" + eventName + "' listener, but never received one.");

							}

						});

					});

					// Finished
					cb();

				}

			);

		});

	});

	describe("Plugin Path Logic:", function() {

		it("should protect plugin paths from cleaning ops", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var ppath = util.path.join( paths.fixtureRoot, "plugins/path-tester.js" );

			// Create a renderer
			rndr = util.getFreshRenderer(
				{
					plugins: [
						ppath
					],
					verbose: false,
					paths: {
						root : ["/x/y/z"]
					}
				}
			);

			// We should start with 17 paths...
			expect( rndr.countFilterPaths() ).to.equal( 18 );

			// Clear the non-plugin paths
			rndr.clearAllPaths();

			// Now we should have 12 paths...
			expect( rndr.countFilterPaths() ).to.equal( 12 );

		});

		it("should not protect plugin paths from forced cleans", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var ppath = util.path.join( paths.fixtureRoot, "plugins/path-tester.js" );

			// Create a renderer
			rndr = util.getFreshRenderer(
				{
					plugins: [
						ppath
					],
					verbose: false
				}
			);

			// We should start with 17 paths...
			expect( rndr.countFilterPaths() ).to.equal( 17 );

			// Clear the non-plugin paths
			rndr.clearAllPaths( true );

			// Now we should have 12 paths...
			expect( rndr.countFilterPaths() ).to.equal( 0 );

		});

		it("should allow single-plugin paths to be removed", function() {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var ppath = util.path.join( paths.fixtureRoot, "plugins/path-tester.js" );

			// Create a renderer
			rndr = util.getFreshRenderer(
				{
					plugins: [
						ppath
					],
					verbose: false
				}
			);

			// Get the path manager
			var pm = rndr.getPathManager();

			// We should start with 17 paths...
			expect( rndr.countFilterPaths() ).to.equal( 17 );

			// Clear the plugin paths for plugin: "path-tester"
			pm.clearPluginPaths( "path-tester" );

			// Now we should have 8 paths...
			expect( rndr.countFilterPaths() ).to.equal( 8 );

		});

	});

	describe("Plugin Context Info:", function() {

		it("should be available in the Dust.js context", function( cb ) {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var ppath = util.path.join( paths.fixtureRoot, "plugins/test-one.js" );

			// Render
			util.renderFixture( fixtureName, function() {

				util.checkHtmlOutput( fixtureName, "test.html", "<p>Hello world from grits</p>");
				cb();

			}, {
				plugins: [
					ppath
				],
				verbose: false
			});

		});


	});

	describe("Data File Handling:", function() {

		it( "should work as expected", function( cb ) {

			// Resolve paths
			var paths = util.getPaths( fixtureName );
			var froot = paths.fixtureRoot;
			var ppath = util.path.join( froot, "plugins/data-tester.js" );

			// Create a renderer
			rndr = util.getFreshRenderer(
				{
					paths: {
						"data": paths.sourceRoot + "/data"
					}
				}
			);
			var dm = rndr.dataManager;

			// Load the plugin manually so that we can
			// pass it in as a function..
			var plugin = require( ppath );

			// Pass the plugin to the renderer
			var iplug = rndr.addPlugin( plugin );

			dm.loadAll().then(

				function() {

					var cd = dm.getContextData();
					expect( cd.storagePlace.example.one ).to.equal( "Hello World\n" );
					cb();

				}

			);

		});

	});

	describe.skip("CLI Usage:", function() {

	it("should work properly", function( cb ) {

		var args = [
			"-w",
			"--plugin plugins/test-one.js",
			"--plugin ./plugins/test-two.js",
			//"-v",
			"--log-filter plugin"
		];
		//var args = ["--log-filter" ,"plugin", "-w" ];


		util.cli( fixtureName, args, function( err, stdout, stderr ) {

			/*
			console.log(" ");
			console.log("------- RAW OUTPUT -------------------------------------------");
			console.log(" ");
			console.log( stdout );
			console.log(" ");
			*/

			/*
			console.log("------- ARRAY OUTPUT -------------------------------------------");
			console.log(" ");
			console.log( arrLogs );
			console.log(" ");
			*/

			cb( err );

		});

	});

});

});
