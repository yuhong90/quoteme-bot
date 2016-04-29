const Hapi = require('hapi');
const Inert = require('inert');
const WebpackPlugin = require('hapi-webpack-plugin');

const server = new Hapi.Server();
server.connection({ port: 3000 });

const io = require('socket.io')(server.listener);

var start = function() {
  server.register([{
      register: WebpackPlugin,
      options: './webpack.dev.config.js'
    },{
      register: Inert,
      options: {}
    }], (err) => {
    if (err) {
      throw err;
    }

    server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: 'build'
        }
      }
    });

    server.route({
      method: 'GET',
      path: '/build/{path*}',
      handler: {
        directory: {
          path: 'build'
        }
      }
    });

    server.start((err) => {
      if (err) {
        throw err;
      }

      console.log('Server running at:', server.info.uri);
    });
  });
}

exports.start = start;
exports.io = io;