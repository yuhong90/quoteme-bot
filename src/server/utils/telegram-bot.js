const TelegramBot = require('node-telegram-bot-api');
const token = process.env['TELEGRAM_TOKEN_2'];
const telegram_filepath = 'https://api.telegram.org/file/bot';
const bot = new TelegramBot(token, {polling: true});
const Promise = require('bluebird');
var io;

bot.setup = function(_io){
  io =_io;
};

var timeout, timeInterval;
var quotesArr = [];
const maxQuoteCount = 30;

bot.getMe().then(function (me) {
  console.log('Hi my botname is %s!', me.username);
});

bot.onText(/\/start/, function (msg) {
  var fromName = msg.from.first_name + ' ' + msg.from.last_name;
  var chatId = msg.chat.id;
  var opts = {reply_to_message_id: msg.message_id};
  bot.sendMessage(chatId, 'Welcome ' + fromName + '. Get started with /quote.', opts);
});

bot.onText(/\/help/, function (msg) {
  var chatId = msg.chat.id;
  var opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['/quote - share your quotes on screen'],
        ['/echo - echo your msg to yourself']]
      })
    };
    bot.sendMessage(chatId, 'Help me help you.', opts);
});

bot.onText(/\/quote (.+)/, function (msg, match) {
  var fromName = msg.from.last_name;
  var user = msg.from.id;
  var time = msg.date;
  var text = match[1];
  var opts = {reply_to_message_id: msg.message_id};

  bot.getUserProfilePhotos(user).then(function(profilePhoto){
    //get medium quality photo
    var fileid = profilePhoto.photos[0][1].file_id;

    bot.getFile(fileid).then(function(file){
      var photoURL = telegram_filepath + bot.token +'/'+ file.file_path;
      sendQuote(fromName, text, time, photoURL, '');
      storeQuote(user, fromName, text, time, photoURL, '');
      sendMsgToUser(user, 'Done! Your quote will be shown on the board!');
    });
  });
});

bot.onText(/\/echo (.+)/, function (msg, match) {
    console.log('/echo : ' + msg.from.id + match[1]);
  var fromId = msg.from.id;
  var fromName = msg.from.last_name;
  var resp = match[1];
  bot.sendMessage(fromId, fromName + ': ' + resp);
});

bot.on('photo', function (msg) {
  var user = msg.from.id;
  var fromName = msg.from.last_name;
  var photo = msg.photo[1].file_id;
  var caption = msg.caption;
  var time = msg.date;

  bot.getUserProfilePhotos(user).then(function(profilePhoto){
    var fileid = profilePhoto.photos[0][1].file_id;

    Promise.join(
    bot.getFileLink(photo).then(function(fileURI){
      console.log('promised' + fileURI);
      return fileURI;
    }),

    bot.getFile(fileid).then(function(file){
      var photoURL = telegram_filepath + bot.token +'/'+ file.file_path;
      return photoURL;
    }),
    function(photoURI, profilePic) {
      storeQuote(user, fromName, caption, time, profilePic, photoURI);
      sendQuote(fromName, caption, time, profilePic, photoURI);
      console.log('photoURI: ' + photoURI + '\n' + 'profilePic: ' + profilePic);
    })
  });
});

bot.start = function startRandomQuotes(){
  var timeNow = Math.floor(Date.now() / 1000);
  //start cycling thru quotes after 5 secs
  timeout = setTimeout(function(){
    sendQuote('speakerbot', 'board ready', timeNow, '', '');
    timeInterval = setInterval(RandomQuote, 10000);
  }, 5000);
}

bot.stop = function stopRandomQuotes(){
  clearTimeout(timeout);
  clearInterval(timeInterval);
}

function sendQuote(user, content, time, profilePic, photo){
  var quote =  {  user: {name: user, profilePic: profilePic}, text: content, created_at: time, photo: photo};
  io.emit('quote sent', quote);
}

function sendMsgToUser(fromId, resp){
  bot.sendMessage(fromId, resp);
}

function storeQuote(user, name, content, time, profilePic, photo){
  if (quotesArr.length >= maxQuoteCount){
     quotesArr.shift();
  }
  var len = quotesArr.push({id:user, name:name, profilePic: profilePic, content:content, created_at: time, photo: photo});
  console.log('quote count: ' + len);
}

function RandomQuote(){
  var len = quotesArr.length;
  if (len > 1){
    var rand = Math.floor((Math.random() * len));
    // sendMsgToUser(quotesArr[rand].user, 'your quote is shown now!');
    sendQuote(quotesArr[rand].name, quotesArr[rand].content, quotesArr[rand].created_at, quotesArr[rand].profilePic, quotesArr[rand].photo);
  }
}

module.exports = bot;