const TelegramBot = require('node-telegram-bot-api');
//const token = process.env['TELEGRAM_TOKEN_2'];
const token = require('./settings').speakerbotToken;
const telegram_filepath = 'https://api.telegram.org/file/bot';
const bot = new TelegramBot(token, {polling: true});
const Promise = require('bluebird');
var io;

bot.setup = function(_io){
  io =_io;
};

var timeout, timeInterval;
var quotesArr = [];
var newQuotesArr = [];
const maxQuoteCount = 30;

bot.getMe().then(function (me) {
  console.log('Hi my botname is %s!', me.username);
});

bot.onText(/\/start/, function (msg) {
  var fromName = msg.from.first_name + ' ' + msg.from.last_name;
  var chatId = msg.chat.id;
  var opts = {reply_to_message_id: msg.message_id};
  bot.sendMessage(chatId, 'Welcome ' + fromName + '. Get started with /quote <your quotes here>.', opts);
});

bot.onText(/\/help/, function (msg) {
  var chatId = msg.chat.id;
  var fromName = getUsername(msg);
  var opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['/quote - share your quotes on screen'],
        ['/echo - echo your msg to yourself']]
      })
    };
    bot.sendMessage(chatId, 'Help me help you, @' + fromName, opts);
});

bot.onText(/\/quote (.+)/, function (msg, match) {  
  var fromName = getUsername(msg); 
  var user = msg.from.id;
  var time = msg.date;
  var text = match[1];
  var opts = {reply_to_message_id: msg.message_id};

  bot.getUserProfilePhotos(user).then(function(profilePhoto){
    //get medium quality photo
    var fileid = profilePhoto.photos[0][1].file_id;

    bot.getFile(fileid).then(function(file){
      var photoURL = telegram_filepath + bot.token +'/'+ file.file_path;
      sendQuoteIfBoardEmpty(user, fromName, text, time, photoURL, '');
      sendMsgToUser(user, getQuoteResponse());

      storeQuote(user, fromName, text, time, photoURL, '');
    });
  });
});

bot.onText(/\/echo (.+)/, function (msg, match) {
    console.log('/echo : ' + msg.from.username + match[1]);
  var fromId = msg.from.id;
  var fromName = getUsername(msg);
  var resp = match[1];
  bot.sendMessage(fromId, fromName + ': mic test. ' + resp);
});

bot.on('photo', function (msg) {
  var user = msg.from.id;
  var fromName = getUsername(msg);
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
      console.log('photoURI: ' + photoURI + '\n' + 'profilePic: ' + profilePic);
      sendQuoteIfBoardEmpty(user, fromName, caption, time, profilePic, photoURI)
      sendMsgToUser(user, getQuoteResponse());
      storeQuote(user, fromName, caption, time, profilePic, photoURI); 
    })
  });

});

bot.start = function startRandomQuotes(){
  var timeNow = Math.floor(Date.now() / 1000);
  //start cycling thru quotes after 5 secs
  timeout = setTimeout(function(){
    sendQuote('speakerbot', 'board ready - Send your quotes with /quotes <your quotes>!', timeNow, '', '');
    timeInterval = setInterval(RandomQuote, 10000);
  }, 5000);
}

bot.stop = function stopRandomQuotes(){
  clearTimeout(timeout);
  clearInterval(timeInterval);
}

function getUsername(msg){
  var username = msg.from.username;
  var firstlastname = msg.from.first_name + ' ' + msg.from.last_name;

  if (username !== ''){
    return username;
  }
  return firstlastname;
}

function getQuoteResponse(){
  if (newQuotesArr.length === 0){
    return 'Done! Your quote will be shown on the board now!';
  }else{
    return 'Done! Your quote will be queued behind ' + newQuotesArr.length + ' quote(s)!';
  }
}

function checkQuoteArrEmpty(){
  return (quotesArr.length === 0);
}

function sendQuoteIfBoardEmpty(id, user, content, time, profilePic, photo){ 
  if (checkQuoteArrEmpty()){
    console.log('new quote sent, board was empty');
    sendQuote(user, content, time, profilePic, photo);  
  }else{
    console.log('new quote queued');
    queueNewQuote(id, user, content, time, profilePic, photo);
  }
}

function sendQuote(user, content, time, profilePic, photo){
  var quote =  { user: {name: user, profilePic: profilePic}, text: content, created_at: time, photo: photo};
  io.emit('quote sent', quote);
}

function storeQuote(user, name, content, time, profilePic, photo){
  if (quotesArr.length >= maxQuoteCount){
     quotesArr.shift();
  }
  var len = quotesArr.push({id:user, name:name, profilePic: profilePic, content:content, created_at: time, photo: photo});
  console.log('stored quote count: ' + len);
}

function queueNewQuote(user, name, content, time, profilePic, photo){ 
  var len = newQuotesArr.push({id:user, name:name, profilePic: profilePic, content:content, created_at: time, photo: photo});
  console.log('newQuotes in queue: ' + len);
}

function clearNewQuoteQueue(){
  if (newQuotesArr.length > 0){
      var quote = newQuotesArr.shift();
      console.log('newQuotes left: ' + newQuotesArr.length);
      sendQuote(quote.name, quote.content, quote.created_at, quote.profilePic, quote.photo);
      // sendMsgToUser(quotesArr[rand].user, 'your quote is shown now!');
      return true;
  }
  return false;
}

function RandomQuote(){ 
  var len = quotesArr.length;
    if (!clearNewQuoteQueue() && len > 1){
      var rand = Math.floor((Math.random() * len));
      console.log('randQuote: ' + rand);
      sendQuote(quotesArr[rand].name, quotesArr[rand].content, quotesArr[rand].created_at, quotesArr[rand].profilePic, quotesArr[rand].photo);      
    }
}

function sendMsgToUser(fromId, resp){
  bot.sendMessage(fromId, resp);
}

module.exports = bot;