const server = require('../server');
const db = require('../db');

class QuoteSystem {
  constructor() {
    this.quoteStore = [];
    this.quoteQueue = [];
    this.maxQuoteLimit = 30;
    this._randomQuoteInterval = {};
    this._broadcastInterval = {};
  }

  save(quote) {
    if (this.quoteStore.length >= this.maxQuoteLimit) {
      this.quoteStore.shift();
    }
    this.quoteStore.push(quote);
    db.one('INSERT INTO quotes(quote) VALUES($1)', [JSON.stringify(quote)] )
      .then(function(data) {
        console.log(data);
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  queue(quote) {
    this.quoteQueue.push(quote);
    this.save(quote);
    return this.reply();
  }

  broadcast() {
    if (this.quoteQueue.length > 0) {
      server.io.emit('quote sent', this.quoteQueue.shift());
    }
  }

  reply() {
    if (this.quoteQueue.length <= 1) {
      return 'Success! Your quote will be shown on the board now!';
    } else {
      return 'Success! Your quote is queued behind ' + (this.quoteQueue.length - 1) + ' quote(s)!';
    }
  }

  randomQuote() {
    if (this.quoteQueue.length > 0 || this.quoteStore.length === 0) {
      return;
    }
    let rand = Math.floor((Math.random() * this.quoteStore.length));
    console.log('Now showing quote #' + rand);
    console.log('Queue: ' + this.quoteQueue.length);
    console.log('Store: ' + this.quoteStore.length);
    this.quoteQueue.push(this.quoteStore[rand]);
  }

  init() {
    db.any('SELECT quote from quotes')
      .then((data) => {
        this.quoteStore = data;
      })
      .catch(function(error) {
        console.log(error);
      });
    this._randomQuoteInterval = setInterval(() => { this.randomQuote() }, 10000);
    this._broadcastInterval = setInterval(() => { this.broadcast() }, 10000);
  }
}

module.exports = QuoteSystem;