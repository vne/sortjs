module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.author %> <%= grunt.template.today("dd.mm.yyyy") %> */\n'
			},
			build: {
				src: 'sort.js',
				dest: 'sort.min.js'
			}
		},
		test: {
			options: {
				globals: ['should'],
				timeout: 3000,
				ignoreLeaks: false,
				ui: 'bdd',
				reporter: 'tap'
			}
		},
		markdown: {
			all: {
				expand: true,
				src: '*.md',
				dest: '.',
				ext: '.html'
			}
		}
	});
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.renameTask('simplemocha', 'test');

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-markdown');

	grunt.registerTask('default', ['test', 'uglify', ]);
	grunt.registerTask('build', ['uglify', 'markdown']);
}