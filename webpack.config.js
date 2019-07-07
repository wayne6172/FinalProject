var path = require('path');
var AutoDllPlugin = require('autodll-webpack-plugin');

var config = {
    module: {}
};

var hw5Config = Object.assign({},config,{
    name: "main",
    entry: "./test/main.js",
    output: {
        path: path.resolve(__dirname,'test/build'),
        filename: "main.bundle.js"
    },
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [
        new AutoDllPlugin({
            filename: '[name].dll.js',
            entry: {
                vendor: ['three','three-orbitcontrols','jquery']
            }
        })
    ],

    stats: {
        colors: true
    },
    devtool: 'source-map'
})

module.exports = [
    hw5Config
];