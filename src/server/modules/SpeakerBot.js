const Slimbot = require('slimbot');
const Promise = require('bluebird');
const rp = require('request-promise');

const QuoteSystem = require('./QuoteSystem');
const quoteSystem = new QuoteSystem;

class SpeakerBot extends Slimbot {
  constructor(token) {
    super(token);
    this._config = {
      token: token,
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

  getFileLink(filePath) {
    return this._config.telegram_filepath + this._config.token + '/' + filePath;
  }

  welcomeMessage(message) {
    var fromName = message.from.first_name + ' ' + message.from.last_name;
    var chatId = message.chat.id;
    var opts = {reply_to_message_id: message.message_id};
    var msg = 'Welcome ' + fromName + '. Get started with /quote <your quotes here>.';
    super.sendMessage(chatId, msg, opts);
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
      .then(resp => { return resp.result.photos[0][1].file_id })
      .then(fileId => {
        return this.getFile(fileId);
      })
      .then(resp => {
        return this.getFileLink(resp.result.file_path);
      })
      .then(profilePhotoFileURI => {
        return rp({
          uri: profilePhotoFileURI,
          encoding: null,
          resolveWithFullResponse: true
        });
      })
      .then(response => {
        return this.encodeBase64(response);
      })
      .then((profilePhotoBase64) =>{
        quote.user.profilePic = profilePhotoBase64;
        this.sendMessage(userId, quoteSystem.queue(quote));
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
        .then(resp => { return resp.result.photos[0][1].file_id })
        .then(fileId => {
          return this.getFile(fileId);
        })
        .then(resp => {
          return this.getFileLink(resp.result.file_path);
        })
        .then(profilePhotoFileURI => {
          return rp({
            uri: profilePhotoFileURI,
            encoding: null,
            resolveWithFullResponse: true
          });
        })
        .then(response => {
          return this.encodeBase64(response);
        }),
      super.getFile(photo)
        .then(resp => {
          return this.getFileLink(resp.result.file_path);
        })
        .then(photoURI => {
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
        this.sendMessage(userId, quoteSystem.queue(quote));
      }
    ).catch((error) => {
        console.log(error);
      });
  }

  init() {
    this.on('message', (message) => {
      let re = /\quote/;
      if (re.test(message.text)) {
        let re = /\quote (.+)/;
        this.processQuote(message, re.exec(message.text));
      } else if (message.photo) {
        this.processPhoto(message);
      }
    });

    super.startPolling();

    quoteSystem.init();
  }
}

module.exports = SpeakerBot;