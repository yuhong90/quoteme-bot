import React from 'react';
import IO from 'socket.io-client';
import Tweet from './Tweet';
import Moment from 'moment';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { tweet: {  user: {name: 'account'}, text: 'Waiting for tweet...' } };
  }

  componentDidMount() {
    const socket = IO();
    socket.on('tweet sent', (tweet) => {
      this.addTweet(tweet);
    });
  }

  componentWillReceiveProps(newTweet) {
    this.setState({ tweet: newTweet });
  }

  render() {
    return (
      <Tweet tweet={this.state.tweet} />
    )
  }

  addTweet(tweet) {
    // regex pattern for matching URLs (http/https)
    let regex = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/ig;
    let body = tweet.text;
    tweet.text = body.replace(regex, '');

    // format time for Tweet component
    let t = new Date(Date.parse(tweet.created_at));
    tweet.formattedTime = Moment(t).format('h:mm:ss a');
    this.setState({ tweet: tweet });
  }
}