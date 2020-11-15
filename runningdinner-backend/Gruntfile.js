module.exports = function (grunt) {

  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    revision: {
      number: '<%= gitinfo.local.branch.current.shortSHA %>'
    },

    srcDir: 'src/main/client',

    srcCssDir: '<%= srcDir %>/css',
    srcHtmlDir: '<%= srcDir %>/html',
    srcLessDir: '<%= srcDir %>/less',
    srcJsDir: '<%= srcDir %>/js',
    srcImagesDir: '<%= srcDir %>/images',

    vendorDir: 'node_modules',

    distDir: 'src/main/resources/static',
    distCssDir: '<%= distDir %>/css',
    distJsDir: '<%= distDir %>/js',

    clean: {
      distDir: '<%= distDir %>'
    },

    less: {
      files: {
        compress: true,
        ieCompat: false,
        cleancss: true,
        files: {
          '<%= srcCssDir %>/app.css': '<%= srcLessDir %>/main.less'
        }
      }
    },

    env: {
      GOOGLE_MAPS_KEY_JS: grunt.option('GOOGLE_MAPS_KEY_JS')
    },

    concat: {
      options: {
        process: function (src, filepath) {
          return "\n/* Original File: " + filepath + "*/\n" + src;
        }
      },

      app: {
        src: [
          '<%= srcJsDir %>/**/*Module.js',
          '<%= srcJsDir %>/**/*App.js',
          '<%= srcJsDir %>/**/*.js'
        ],
        dest: '<%= distJsDir %>/app.js'
      },

      vendor: {
        src: [
          '<%= vendorDir %>/jquery/dist/jquery.min.js',
          '<%= vendorDir %>/jquery-ui-dist/jquery-ui.min.js',

          '<%= vendorDir %>/bootstrap/dist/js/bootstrap.min.js',
          '<%= vendorDir %>/angular/angular.min.js',
          '<%= vendorDir %>/angular-sanitize/angular-sanitize.min.js',
          '<%= vendorDir %>/@uirouter/angularjs/release/angular-ui-router.min.js',
          '<%= vendorDir %>/angular-dragdrop/src/angular-dragdrop.min.js',
          '<%= vendorDir %>/angular-ui-bootstrap/dist/ui-bootstrap.js',
          '<%= vendorDir %>/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
          '<%= vendorDir %>/ui-select/dist/select.min.js',

          '<%= vendorDir %>/angular-file-upload/dist/angular-file-upload.min.js',
          '<%= vendorDir %>/angular-animate/angular-animate.min.js',

          '<%= vendorDir %>/angular-dynamic-locale/tmhDynamicLocale.min.js',
          '<%= vendorDir %>/angular-translate/dist/angular-translate.min.js',

          '<%= vendorDir %>/angular-toastr/dist/angular-toastr.tpls.min.js',
          '<%= vendorDir %>/angular-cookies/angular-cookies.min.js',
          '<%= vendorDir %>/angular-translate-storage-local/angular-translate-storage-local.min.js',
          '<%= vendorDir %>/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js',
          '<%= vendorDir %>/lodash/lodash.min.js',
          '<%= vendorDir %>/moment/min/moment.min.js',
          '<%= vendorDir %>/angular-promise-buttons/dist/angular-promise-buttons.min.js',
          '<%= vendorDir %>/ngmap/build/scripts/ng-map.min.js'
        ],
        dest: '<%= distJsDir %>/vendor.js'
      },

      appCss: {
        src: [
          // '<%= srcCssDir %>/bootstrap-custom.css',
          // '<%= vendorDir %>/jquery-ui/themes/smoothness/jquery-ui.min.css',
          // '<%= vendorDir %>/richtext-editor/css/editor.css',
          //'<%= vendorDir %>/toastr/toastr.min.css',

          '<%= vendorDir %>/ui-select/dist/select.min.css',
          '<%= vendorDir %>/angular-toastr/dist/angular-toastr.min.css',
          '<%= vendorDir %>/font-awesome/css/font-awesome.min.css',

          '<%= vendorDir %>/angular-promise-buttons/example/style.css',

          '<%= srcCssDir %>/app.css'
        ],
        dest: '<%= distCssDir %>/app.css'
      }
    },

    uglify: {
      options: {
        mangle: true,
        compress: {}
      },
      "app-js": {
        options: {
          preserveComments: 'some'
        },
        src: '<%= distJsDir %>/app.js',
        dest: '<%= distJsDir %>/app.js'
      }
    },

    replace: {
      buildno: {
        files: [
          {
            expand: true,
            // flatten: true,
            src: ['**/*.{js,css,html}'],
            cwd: '<%= distDir %>/',
            dest: '<%= distDir %>'
          }
        ],
        options: {
          prefix: '',
          variables: {
            '@@buildno@@': '<%= revision.number %>'
          }
        }
      },
      "buildno-dev": {
        files: [
          {
            expand: true,
            src: '**/*.{js,css,html}',
            cwd: '<%= distDir %>',
            dest: '<%= distDir %>'
          }
        ],
        options: {
          prefix: '',
          variables: {
            '@@buildno@@': Date.now
          }
        }
      },
      "google-maps-key": {
        files: [
          {
            expand: true,
            src: '**/*.{js,html}',
            cwd: '<%= distDir %>',
            dest: '<%= distDir %>'
          }
        ],
        options: {
          prefix: '',
          variables: {
            '@@googlemapskey@@': '<%= env.GOOGLE_MAPS_KEY_JS %>'
          }
        }
      }
    },

    copy: {
      'font-awesome': {
        expand: true,
        flatten: true,
        src: ['<%= vendorDir %>/font-awesome/fonts/*'],
        dest: '<%= distDir %>/fonts/',
        filter: 'isFile'
      },

      'font-bootstrap': {
        expand: true,
        flatten: true,
        src: ['<%= vendorDir %>/bootstrap/fonts/*'],
        dest: '<%= distDir %>/fonts/',
        filter: 'isFile'
      },

      'pages': {
        expand: true,
        flatten: false,
        cwd: '<%= srcHtmlDir %>/',
        src: ['**/*.html'],
        dest: '<%= distDir %>/'
      },

      'views': {
        expand: true,
        flatten: false,
        cwd: '<%= srcJsDir %>/',
        src: ['**/*.html'],
        dest: '<%= distDir %>/'
      },

	  'resources': {
	      expand: true,
	      flatten: false,
	      cwd: '<%= srcDir %>/resources/',
	      src: ['**'],
	      dest: '<%= distDir %>/resources/',
	      filter: 'isFile'
	    },
      
      'images': {
        expand: true,
        flatten: false,
        cwd: '<%= srcImagesDir %>/',
        src: ['**'],
        dest: '<%= distDir %>/images/',
        filter: 'isFile'
      }
    },


    ngAnnotate: {
      options: {
        singleQuotes: true
      },
      compile: {
        files: {
          '<%= distJsDir %>/app.js': ['<%= distJsDir %>/app.js']
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: false // fail on errors
      },
      all: ['Gruntfile.js', '<%= srcJsDir %>/**/*.js']
    },

    cssmin: {
      all: {
        expand: true,
        cwd: '<%= distDir %>',
        src: ['**/*.css'],
        dest: '<%= distDir %>'
      }
    },

    watch: {
      main: {
        files: ['<%= srcJsDir %>/**/*.js', '<%= srcJsDir %>/**/*.html', '<%= srcHtmlDir %>/**/*.html', '<%= srcCssDir %>/**/*.css', 'Gruntfile.js'],
        tasks: ['build-dev']
      },
      styles: {
        files: ['<%= srcLessDir %>/**/*.less'],
        tasks: ['less'],
        options: {
          nospawn: true
        }
      }
    },

    'http-server': {
      'dev': {
        root: '<%= distDir %>',
        port: 80,
        host: "127.0.0.1",
        cache: -1,
        openBrowser: false,
        proxy: "http://localhost:9090"
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-gitinfo');
  grunt.loadNpmTasks('grunt-http-server');
  grunt.loadNpmTasks('grunt-env');

  // load gitinfo
  grunt.task.run('gitinfo');

  grunt.registerTask('build-dev', ['clean', 'env', 'less', 'copy', 'jshint', 'concat', 'replace:buildno-dev', 'replace:google-maps-key']);
  grunt.registerTask('build', ['clean', 'less', 'copy', 'jshint', 'concat', 'replace:buildno', 'replace:google-maps-key', 'compress-app-js', 'compress-app-css']);
  grunt.registerTask('default', ['clean', 'build-dev', 'watch']);

  grunt.registerTask('compress-app-js', 'Minify javascript of app', ['ngAnnotate', 'uglify:app-js']);
  grunt.registerTask('compress-app-css', 'Minify css of the app', ['cssmin']);

};
