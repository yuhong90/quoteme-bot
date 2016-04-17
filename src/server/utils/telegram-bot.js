const TelegramBot = require('node-telegram-bot-api');
const token = process.env['TELEGRAM_TOKEN'];
const telegram_filepath = 'https://api.telegram.org/file/bot';
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
  var text = match[1];
  var opts = {reply_to_message_id: msg.message_id};
  var len = quotesArr.push({id:user, name:fromName, content:text});

  bot.getUserProfilePhotos(user).then(function(profilePhoto){
    //get medium quality photo
    var fileid = profilePhoto.photos[0][1].file_id;

    bot.getFile(fileid).then(function(file){
      //TODO: send photo link over for display
      var photoURL = telegram_filepath + bot.token +'/'+ file.file_path;
      console.log(photoURL);
      sendTweet(fromName, text,photoURL);
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
	console.log('startRandomQuotes');
  //start cycling thru quotes after 5 secs
  timeout = setTimeout(function(){
    sendTweet('speakerbot', 'board ready');
    timeInterval = setInterval(RandomQuote, 10000);
  }, 5000);
}

bot.stop = function stopRandomQuotes(){
  clearTimeout(timeout);
  clearInterval(timeInterval);
}

function sendTweet(user, content, pic){
  var tweet =  {  user: {name: user, photo: pic}, text: content};
  io.emit('tweet sent', tweet);
}

function sendMsgToUser(fromId, resp){
  bot.sendMessage(fromId, resp);
}

function RandomQuote(){
  var len = quotesArr.length;
  if (len > 1){
    var rand = Math.floor((Math.random() * len));
    // sendMsgToUser(quotesArr[rand].user, 'your quote is shown now!');
    sendTweet(quotesArr[rand].name, quotesArr[rand].content);
  }
}

module.exports = bot;