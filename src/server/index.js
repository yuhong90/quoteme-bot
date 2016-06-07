// start server
const server = require('./server');
server.start();

const SpeakerBot = require('./modules/SpeakerBot');
const speakerBot = new SpeakerBot(process.env['TELEGRAM_TOKEN_2']);

speakerBot.init();