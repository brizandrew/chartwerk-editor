const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const _ = require('lodash');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');


module.exports = {
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
  },
  entry: _.zipObject(
    glob.sync('./src/js/*.js*').map(f => path.basename(f, path.extname(f))),
    glob.sync('./src/js/*.js*'),
  ),
  output: {
    path: path.resolve(__dirname, '/dist/js'),
    filename: 'js/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                'env',
                {
                  targets: {
                    browsers: ['last 2 versions'],
                  },
                  debug: true,
                  modules: false,
                },
              ],
              'react',
              'stage-0',
              'airbnb',
            ],
          },
        },
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['postcss-loader', 'sass-loader'],
        }),
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader'],
        }),
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new ExtractTextPlugin({
      filename: getPath => getPath('css/[name].css').replace('css/js', 'css'),
      allChunks: true,
    }),
    new OptimizeCssAssetsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new UglifyJSPlugin({ sourceMap: true }),
    new webpack.ProvidePlugin({
      fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Util: 'exports-loader?Util!bootstrap/js/dist/util',
      Tab: 'exports-loader?Tab!bootstrap/js/dist/tab',
    }),
  ],
  devtool: 'source-map',
};