const TelegramBot = require('node-telegram-bot-api');
const Promise = require('bluebird');
const rp = require('request-promise');

class SpeakerBot extends TelegramBot {
  constructor(token, options, io) {
    super(token, options);
    this._io = io;
    this.quotesArray = [];
    this.newQuotesArray = [];
    this.timeOut = {};
    this.timeInterval = {};
    this._config = {
      token: token,
      maxQuoteCount: 30,
      telegram_filepath: 'https://api.telegram.org/file/bot'
    };
  }

  encodeBase64(response) {
    var string = 'data:' + response.headers['content-type'] + ';base64,' + new Buffer(response.body).toString('base64');
    return string;
  }

  getUsername(message) {
    var username = message.from.username;
    var firstlastname = message.from.first_name + ' ' + message.from.last_name;

    if (username !== ''){
      return username;
    }
    return firstlastname;
  }

  quoteArrayIsEmpty() {
    return (this.quotesArray.length === 0);
  }

  getQuoteResponse() {
    if (this.newQuotesArray.length === 0) {
      return 'Done! Your quote will be shown on the board now!';
    } else {
      return 'Done! Your quote will be queued behind ' + this.newQuotesArray.length + ' quote(s)!';
    }
  }

  sendQuoteIfBoardEmpty(quote) {
    if (this.quoteArrayIsEmpty()) {
      console.log('new quote sent, board was empty');
      this.sendQuote(quote);
    } else {
      console.log('new quote queued');
      this.queueNewQuote(quote);
    }
  }

  queueNewQuote(quote) {
    var len = this.newQuotesArray.push(quote);
    console.log('newQuotes in queue: ' + len);
  }

  sendMsgToUser(userId, resp) {
    super.sendMessage(userId, resp);
  }

  storeQuote(quote) {
    if (this.quotesArray.length >= this._config.maxQuoteCount) {
      this.quotesArray.shift();
    } else {
      this.quotesArray.push(quote);
    }
  }

  sendQuote(quote) {
    this._io.emit('quote sent', quote);
  }

  welcomeMessage(message) {
    var fromName = message.from.first_name + ' ' + message.from.last_name;
    var chatId = message.chat.id;
    var opts = {reply_to_message_id: message.message_id};
    var msg = 'Welcome ' + fromName + '. Get started with /quote <your quotes here>.';
    super.sendMessage(chatId, msg, opts);
  }

  helpMessage(message) {
    var chatId = message.chat.id;
    var fromName = this.getUsername(message);
    var opts = {
      reply_to_message_id: message.message_id,
      reply_markup: JSON.stringify({
        keyboard: [
          ['/quote - share your quotes on screen'],
          ['/echo - echo your msg to yourself']]
        })
    };
    super.sendMessage(chatId, 'Help me help you, @' + fromName, opts);
  }

  echoMessage(message, match) {
    var fromId = message.from.id;
    var fromName = this.getUsername(message);
    var resp = match[1];
    super.sendMessage(fromId, fromName + ': mic test. ' + resp);
  }

  processQuote(message, match) {
    var userId = message.from.id;
    var quote = {
      user: {
        id: userId,
        name: this.getUsername(message),
        profilePic: ''
      },
      text: match[1],
      created_at: message.date,
      photo: ''
    }

    super.getUserProfilePhotos(userId)
      .then((profilePhoto) => { return profilePhoto.photos[0][1].file_id})
      .then((profilePhotoId) => {
        return super.getFile(profilePhotoId);
      })
      .then((profilePhotoFile) => {
        return this._config.telegram_filepath + this._config.token + '/' + profilePhotoFile.file_path;
      })
      .then((profilePhotoFileURI) => {
        return rp({
          uri: profilePhotoFileURI,
          encoding: null,
          resolveWithFullResponse: true
        });
      })
      .then((response) => {
        return this.encodeBase64(response);
      })
      .then((profilePhotoBase64) =>{
        quote.user.profilePic = profilePhotoBase64;
        this.sendQuoteIfBoardEmpty(quote);
        this.sendMsgToUser(userId, this.getQuoteResponse());
        this.storeQuote(quote);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  processPhoto(message) {
    var userId = message.from.id;
    var photo = message.photo[1].file_id;
    var quote = {
      user: {
        id: userId,
        name: this.getUsername(message),
        profilePic: ''
      },
      text: message.caption,
      created_at: message.date,
      photo: ''
    }

    Promise.join(
      super.getUserProfilePhotos(userId)
        .then((profilePhoto) => { return profilePhoto.photos[0][1].file_id})
        .then((profilePhotoId) => {
          return super.getFile(profilePhotoId);
        })
        .then((profilePhotoFile) => {
          return this._config.telegram_filepath + this._config.token + '/' + profilePhotoFile.file_path;
        })
        .then((profilePhotoFileURI) => {
          return rp({
            uri: profilePhotoFileURI,
            encoding: null,
            resolveWithFullResponse: true
          });
        })
        .then((response) => {
          return this.encodeBase64(response);
        }),
      super.getFileLink(photo)
        .then((photoURI) => {
          return rp({
            uri: photoURI,
            encoding: null,
            resolveWithFullResponse: true
          });
        })
        .then((response) => {
          return this.encodeBase64(response);
        }),
      (profilePhotoBase64, photoBase64) => {
        quote.user.profilePic = profilePhotoBase64;
        quote.photo = photoBase64;

        this.sendQuoteIfBoardEmpty(quote);
        this.sendMsgToUser(userId, this.getQuoteResponse());
        this.storeQuote(quote);
      }
    ).catch((error) => {
        console.log(error);
      });
  }

  getMe() {
    super.getMe().then(function(me) {
      console.log('Hi my botname is %s!', me.username);
    });
  }

  clearNewQuoteQueue() {
    if (this.newQuotesArray.length > 0){
      var quote = this.newQuotesArray.shift();
      console.log('newQuotes left: ' + this.newQuotesArray.length);
      this.sendQuote(quote);
      // sendMsgToUser(quotesArr[rand].user, 'your quote is shown now!');
      return true;
    }
    return false;
  }

  getRandomQuote() {
    var len = this.quotesArray.length;
    if (!this.clearNewQuoteQueue() && len > 1){
      var rand = Math.floor((Math.random() * len));
      console.log('randQuote: ' + rand);
      this.sendQuote(this.quotesArray[rand]);
    }
    this.newQuotesArray.shift();
  }

  startRandomQuotes() {
    var timeNow = Math.floor(Date.now() / 1000);
    var quote = {
      user: {
        id: '',
        name: '',
        profilePic: ''
      },
      text: '',
      created_at: '',
      photo: ''
    }

    this.timeOut = setTimeout(() => {
      quote.user.name = 'speakerbot';
      quote.text = 'Hey! Send your quotes to this board with /quote <message>!';
      quote.created_at = timeNow;

      this.sendQuote(quote);
      this.timeInterval = setInterval(() => { this.getRandomQuote() }, 10000);
    }, 5000);
  }

  init() {
    super.onText(/\/start/, (message) => {
      this.welcomeMessage(message);
    });

    super.onText(/\/help/, (message) => {
      this.helpMessage(message);
    });

    super.onText(/\/echo (.+)/, (message, match) => {
      this.echoMessage(message, match);
    });

    super.onText(/\/quote (.+)/, (message, match) => {
      this.processQuote(message, match);
    });

    super.on('photo', (message) => {
      this.processPhoto(message);
    });

    this.startRandomQuotes();
  }
}

module.exports = SpeakerBot;