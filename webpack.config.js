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
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'index.html', to: 'index.html' },
                { from: 'index.css', to: 'index.css' }
            ],
        }),
    ],
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
