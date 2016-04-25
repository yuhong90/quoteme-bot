const path = require('path');
const webpack = require('webpack');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'src/app'),
  css: path.join(__dirname, 'src/app/assets/main.css'),
  build: path.join(__dirname, 'build')
};

module.exports = {
  entry: {
    app: PATHS.app,
    css: PATHS.css,
    // define multiple entry points for vendor files
    vendor: Object.keys(pkg.dependencies).filter(function(v) {
      return v;
    })
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: PATHS.build,
    filename: '[name].[chunkhash].min.js',
    chunkFilename: '[chunkhash].min.js',
    publicPath: '/build/'
  },
  module: {
    preLoaders: [
      {
      test: /\.jsx?$/,
      loaders: ['eslint'],
      include: PATHS.app
      }
    ],
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css'),
        include: PATHS.app
      },
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: PATHS.app
      }
    ]
  },
  // devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        // Set NODE_ENV to 'production' so that webpack doesn't build the project with react-transform plugin
        // This affects react lib size
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    // clean build path while building
    new CleanPlugin([PATHS.build], {
      verbose: false
    }),
    // extract css into its own chunk
    new ExtractTextPlugin('[name].[chunkhash].css'),
    // generate html
    new HtmlWebpackPlugin({
      template: 'src/templates/index.ejs',
      title: 'React app',
      appMountId: 'react',
      inject: false,
      chunksSortMode: 'dependency'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']
    }),
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  ]
};