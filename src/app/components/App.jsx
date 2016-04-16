import React from 'react';
import IO from 'socket.io-client';
import Quote from './Quote';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    var today = new Date();
    var UTCstring = today.toUTCString();

    this.state = { quote: { created_at: UTCstring, user: {name: 'account'}, text: 'Waiting for quote...' } };
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