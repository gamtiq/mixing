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
                src: ["<%= src %>"],
                options: {
                    destination: "doc",
                    template: "node_modules/ink-docstrap/template",
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
        
        push: {
            options: {
                files: ["package.json", "bower.json", "component.json"],
                commitMessage: "Release version %VERSION%",
                commitFiles: ["-a"],
                tagName: "%VERSION%",
                tagMessage: "Version %VERSION%"
            }
        }
        
    });
    
    // Plugins
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-mocha-cli");
    grunt.loadNpmTasks("grunt-umd");
    grunt.loadNpmTasks("grunt-push-release");
    
    // Tasks
    grunt.registerTask("build", ["umd", "uglify"]);
    grunt.registerTask("doc", ["jsdoc"]);
    grunt.registerTask("test", ["mochacli"]);
    grunt.registerTask("default", ["jshint", "mochacli"]);
    grunt.registerTask("all", ["default", "build", "doc"]);
    
    grunt.registerTask("release", ["push"]);
    grunt.registerTask("release-minor", ["push:minor"]);
    grunt.registerTask("release-major", ["push:major"]);
};
