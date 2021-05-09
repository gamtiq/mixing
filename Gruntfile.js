module.exports = function(grunt) {
    
    // Configuration
    grunt.initConfig({
        
        name: "mixing",
        dest: "<%= name %>.js",
        src: "index.js",
        
        jshint: {
            files: ["*.js"],
            
            options: {
                // Enforcing
                bitwise: true,
                camelcase: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                nonew: true,
                quotmark: true,
                undef: true,
                unused: true,
                
                // Environment
                node: true
            }
        },
        
        jsdoc: {
            dist: {
                options: {
                    configure: "jsdoc-conf.json"
                }
            }
        },
        
        mochacli: {
            mixing: {}
        },
        
        uglify: {
            minify: {
                src: "dist/<%= dest %>",
                dest: "dist/<%= name %>.min.js"
            }
        },
        
        umd: {
            dist: {
                template: "unit",
                src: "<%= src %>",
                dest: "dist/<%= dest %>",
                objectToExport: "<%= name %>",
                globalAlias: "<%= name %>"
            }
        },
        
        bump: {
            options: {
                files: ["package.json", "package-lock.json", "bower.json", "component.json"],
                commitMessage: "Release version %VERSION%",
                commitFiles: ["-a"],
                tagName: "%VERSION%",
                tagMessage: "Version %VERSION%",
                pushTo: "origin"
            }
        }
        
    });
    
    // Plugins
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-mocha-cli");
    grunt.loadNpmTasks("grunt-umd");
    grunt.loadNpmTasks("grunt-bump");
    
    // Tasks
    grunt.registerTask("build", ["umd", "uglify"]);
    grunt.registerTask("doc", ["jsdoc"]);
    grunt.registerTask("test", ["mochacli"]);
    grunt.registerTask("default", ["jshint", "mochacli"]);
    grunt.registerTask("all", ["default", "build", "doc"]);
    
    grunt.registerTask("release", ["bump"]);
    grunt.registerTask("release-minor", ["bump:minor"]);
    grunt.registerTask("release-major", ["bump:major"]);
    
    // For Travis CI service
    grunt.registerTask("travis", ["all"]);
};
