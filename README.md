# Telegram Quote Bot

Simple Telegram bot to send messages and images to a React front-end via commands


## Getting started

### Start Dev Server
```javascript
npm start
```
Runs Hapi server at [http://localhost:3000](http://localhost:3000) using pm2.
Making changes to server.js will automatically restart the process.
Making change to your React app will trigger hot reload.

### Production build
```javascript
npm run build
```
Compiles /build folder

### Deployment
* Remove Webpack plugin from Hapi
* In webpack.production.config, output.publicPath will be the path your assets are linked to in index.html
* Set up routes accordingly for assets.
* Update NPM scripts in package.json; remove --watch and add log files:

  ```javascript
  pm2 start src/server/server.js -o server.log -e errors.log
  ```

## Upcoming features

## Changelog

* 0.2.0

  [Feature] Users can now send images to the board by sending an image to the bot

* 0.1.0

  Stable version, users can send messages to the board using /quote