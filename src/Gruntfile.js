module.exports = function (grunt) {
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      less: {
          main: {
              src: ['less/main.less'],
              dest: 'main.css'
          }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.registerTask('lessToCSS', ['less', 'autoprefixer', 'cssmin']);

    grunt.registerTask('build', ['less']);
    grunt.registerTask('default', ['build']);
}
