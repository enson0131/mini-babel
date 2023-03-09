const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const path = require('path');
module.exports = {
    devtool: false,
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.join(__dirname, './dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs',
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                plugins: ['lodash'],
                presets: ['@babel/preset-env']
              }
            }
          }]
    },
    plugins: [
        new LodashModuleReplacementPlugin,
    ],
};