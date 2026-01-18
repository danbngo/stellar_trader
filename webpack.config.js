const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './main.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: false
    },
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, './'),
        },
        compress: true,
        port: 8080,
        hot: true
    }
};
