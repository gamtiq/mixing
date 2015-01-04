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
                    destination: "doc"
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
                src: "dist/<%= dest %>",
                objectToExport: "<%= name %>",
                globalAlias: "<%= name %>",
                indent: "    "
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
    grunt.registerTask("compile", "Creates distribution source", function() {
        var file = grunt.file,
            options = {encoding: "utf8"},
            sLibPath = "./index.js",
            sShimPath = "./components/gamtiq/isarray-shim/0.1.0/index.js",
            sLib, sShim;
        if (file.isFile(sShimPath)) {
            if (file.isFile(sLibPath)) {
                sShim = file.read(sShimPath, options);
                if (sShim) {
                    sShim = sShim.substring(0, sShim.indexOf("module.exports")) + "\n";
                    
                    sLib = file.read(sLibPath, options);
                    file.write("./dist/mixing.js", 
                                sLib.substring(0, sLib.indexOf("// Load shim")) + sShim + sLib.substring(sLib.indexOf("}") + 1), 
                                options);
                }
                else {
                    grunt.warn("Cannot read the source file of required component isarray-shim.");
                }
            }
            else {
                grunt.warn("Cannot find library source file index.js.");
            }
        }
        else {
            grunt.warn("Cannot find the required component isarray-shim.");
        }
    });
    
    grunt.registerTask("build", ["compile", "umd", "uglify"]);
    grunt.registerTask("doc", ["jsdoc"]);
    grunt.registerTask("test", ["mochacli"]);
    grunt.registerTask("default", ["jshint", "mochacli"]);
    grunt.registerTask("all", ["default", "build", "doc"]);
    
    grunt.registerTask("release", ["push"]);
    grunt.registerTask("release-minor", ["push:minor"]);
    grunt.registerTask("release-major", ["push:major"]);
};
