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
				tasks: ['less'],
				options: {
					nospawn: true
				}
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
		mochaTest : {
			test : {
				src : ["test/**/*.js"]
			}
		}
	});

	grunt.registerTask('default', ['less', 'watch:styles']);
	grunt.registerTask("serve", []);
	grunt.registerTask("serve-dev", ['express:dev', 'watch:dev']);
	grunt.registerTask("build", ['less']);
	grunt.registerTask("test", ['mochaTest']);
};
