/*
  Module Bundler | Cannlytics
  Created: 1/5/2021
  Updated: 11/22/2021
*/
const Dotenv = require('dotenv-webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const appName = 'website';

module.exports = env => {
  return {
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? 'source-map' : 'eval',
    devServer: {
      writeToDisk: true, // Write files to disk in dev mode, so that Django can serve the assets.
    },
    resolve: {
      extensions: [ '.js' ]
    },
    entry: [
      `./${appName}/assets/css/cannlytics.scss`,
      `./${appName}/assets/js/index.js`,
      // Optional: Add additional JS here.
    ],
    output: {
      path: path.resolve(__dirname, `${appName}/static/${appName}`),
      filename: './js/bundles/bundle.js',
      libraryTarget: 'var',
      library: 'cannlytics', // Turns JavaScript into a module.
    },
    module: {
      rules: [
        {
          test: /\.s?css$/,
          use: [
            {
              loader: 'file-loader', // Output CSS.
              options: {
                name: './css/bundles/bundle.css',
              },
            },
            {
              loader: 'sass-loader', // Compiles Sass to CSS.
              options: {
                implementation: require('sass'),
                webpackImporter: false,
                sassOptions: {
                  includePaths: ['./node_modules'],
                },
              },
            },
          ],
        },
        {
          test: /\.js$/,
          loader: 'babel-loader', // Convert ES2015 to JavaScript.
          query: {
            "presets": [
              ["@babel/preset-env", {
                "targets": { "esmodules": true }
              }]
            ]
          },
        },
      ],
    },
    plugins: [
      new Dotenv(), // Make .env variables available in entry file.
      new OptimizeCSSAssetsPlugin({}), // Minimize the CSS.
    ],
  }
};
