module.exports = {
    run: {
        firefox: 'nightly',
    },

    ignoreFiles: [
        "build",
        "dist",
        "img/screenshot.png",
        ".idea",".git",
        ".gitignore",
        "genpass.js",
        "README.md",
        "web-ext-artifacts",
        "web-ext-config.js"
    ],

    "artifactsDir": "dist"
};