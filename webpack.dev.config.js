const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
  app: path.join(__dirname, 'src/app'),
  css: path.join(__dirname, 'src/app/assets/main.css'),
  build: path.join(__dirname, 'build')
};

module.exports = {
  entry: [
    'webpack-hot-middleware/client',
    PATHS.app,
    PATHS.css
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: PATHS.build,
    filename: 'bundle.js'
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
        loaders: ['style', 'css'],
        include: PATHS.css
      },
      {
        test: /\.jsx?$/,
        loader: 'babel',
        include: PATHS.app
      }
    ]
  },
  devtool: 'eval-source-map',
  plugins: [
    // generate html
    new HtmlWebpackPlugin({
      template: 'node_modules/html-webpack-template/index.ejs',
      title: 'React app',
      appMountId: 'react',
      inject: false
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  // config for webpack-plugin
  assets: {
    noInfo: false,
    quiet: false,
    stats: {
      assets: true,
      colors: true,
      version: false,
      hash: true,
      timings: false,
      chunks: false,
      chunkModules: false
    }
  }
};