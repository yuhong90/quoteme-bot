const TelegramBot = require('node-telegram-bot-api');
const token = process.env['TELEGRAM_TOKEN_2'];

const bot = new TelegramBot(token, {polling: true});
var io;

bot.setup = function(_io){
  io =_io;
};

var timeout, timeInterval;
var quotesArr = [];

bot.getMe().then(function (me) {
  console.log('Hi my botname is %s!', me.username);
});

bot.onText(/\/start/, function (msg) {
  var chatId = msg.chat.id;
  var opts = {reply_to_message_id: msg.message_id};
  bot.sendMessage(chatId, 'Welcome ', opts);
});

bot.onText(/\/help/, function (msg) {
  var chatId = msg.chat.id;
  var opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['/quote - share your quotes on screen'],
        ['/echo - echo your msg']]
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
  var len = quotesArr.push({id:user, name:fromName, content:text, created_at: time});

  bot.getUserProfilePhotos(user).then(function(profilePhoto){
    //get medium quality photo
    var fileid = profilePhoto.photos[0][1].file_id;

    bot.getFile(fileid).then(function(file){
      console.log(file.file_path);
      //TODO: send photo link over for display
      sendQuote(fromName, text, time);
      quotesArr[len -1].photo = file.file_path;
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
  var chatId = msg.chat.id;
  var photo = msg.photo[0].file_id;

  bot.getFileLink(photo).then(function(fileURI){
    console.log('Promised file: ' + fileURI);
    //TODO: send photo over!
  });
});

bot.start = function startRandomQuotes(){
  var timeNow = Math.floor(Date.now() / 1000);
  //start cycling thru quotes after 5 secs
  timeout = setTimeout(function(){
    sendQuote('speakerbot', 'board ready', timeNow);
    timeInterval = setInterval(RandomQuote, 10000);
  }, 5000);
}

bot.stop = function stopRandomQuotes(){
  clearTimeout(timeout);
  clearInterval(timeInterval);
}


function sendQuote(user, content, time){
  var quote =  {  user: {name: user}, text: content, created_at: time}
  io.emit('quote sent', quote);
}

function sendMsgToUser(fromId, resp){
  bot.sendMessage(fromId, resp);
}

function RandomQuote(){
  var len = quotesArr.length;
  if (len > 1){
    var rand = Math.floor((Math.random() * len));
    // sendMsgToUser(quotesArr[rand].user, 'your quote is shown now!');
    sendQuote(quotesArr[rand].name, quotesArr[rand].content, quotesArr[rand].created_at);
  }
}

module.exports = bot;