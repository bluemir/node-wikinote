module.exports = function(grunt) {
	require('jit-grunt')(grunt, {
		express : "grunt-express-server",
		mochaTest : "grunt-mocha-test"
	});

	grunt.initConfig({
		less: {
			development: {
				options: {
					compress: true,
					yuicompress: true,
					optimization: 2
				},
				files: {
					// destination file and source file
					"public/stylesheets/main.css": "public/less/main.less",
					"public/stylesheets/admin.css": "public/less/admin.less"
				}
			}
		},
		watch: {
			styles: {
				files: ['public/less/**/*.less'], // which files to watch
				tasks: ['less']
			},
			dev : {
				files : ['rotues/**/*', 'app/**/*', 'wikinote.js'],
				tasks: ['express:dev']
			}
		},
		express : {
			options : {
			},
			dev : {
				options : {
					script: "wikinote.js"
				}
			},
			product: {
				options : {
					script: "wikinote.js",
					node_env: 'production'
				}
			}
		},
		concurrent: {
			dev : {
				tasks : ['watch:dev', 'watch:styles'],
				options: {
					logConcurrentOutput: true
				}
			}
		},
		mochaTest : {
			test : {
				src : ["test/**/*.js"]
			}
		}
	});

	grunt.registerTask('default', ['serve-dev']);
	grunt.registerTask("serve-dev", ['express:dev', 'concurrent:dev']);
	grunt.registerTask("build", ['less']);
	grunt.registerTask("test", ['mochaTest']);
};
