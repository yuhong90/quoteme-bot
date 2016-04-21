import React from 'react';
import IO from 'socket.io-client';
import Quote from './Quote';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    var timeNow = Math.floor(Date.now() / 1000);

    this.state = { quote: { created_at: timeNow, user: {name: 'account', profilePic: ''}, text: 'Waiting for quote...', photo: '' } };
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
      <Quote quote={this.state.quote} />
    )
  }

  addQuote(quote) {
    this.setState({ quote: quote });
  }
}