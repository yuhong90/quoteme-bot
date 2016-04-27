import React from 'react';
import IO from 'socket.io-client';
import Instructions from './Instructions';
import Quote from './Quote';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    var timeNow = Math.floor(Date.now() / 1000);

    this.state = { quote: { created_at: timeNow, user: {id: '', name: 'account', profilePic: ''}, text: 'Waiting for quote...', photo: '' } };
  }

  componentDidMount() {
    const socket = IO();
    socket.on('quote sent', (quote) => {
      this.addQuote(quote);
    });
  }

  componentWillReceiveProps(newQuote) {
    this.setState({ quote: newQuote });
  }

  render() {
    return (
      <div className="fullHeight">
        <Instructions />
        <Quote quote={this.state.quote} />
      </div>
    )
  }

  addQuote(quote) {
    this.setState({ quote: quote });
  }
}