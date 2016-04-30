import React from 'react';
import IO from 'socket.io-client';
import Instructions from './Instructions';
import Quote from './Quote';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    var timeNow = Math.floor(Date.now() / 1000);

    this.state = { store:
      { quote:
        {
          created_at: timeNow, user: {id: '', name: 'speakerbot', profilePic: ''}, text: 'Get started by talking to @hive_speaker_bot!', photo: ''
        }
      }
    };
  }

  componentDidMount() {
    const socket = IO();
    socket.on('quote sent', (quote) => {
      this.addQuote(quote);
    });
  }

  componentWillReceiveProps(newQuote) {
    this.setState({ store: newQuote });
  }

  render() {
    return (
      <div className="fullHeight">
        <Instructions />
        <Quote quote={ this.state.store.quote } />
      </div>
    )
  }

  addQuote(quote) {
    this.setState({ store: quote });
  }
}