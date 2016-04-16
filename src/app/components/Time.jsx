import React from 'react';
import Moment from 'moment';

export default class Time extends React.Component {
  constructor(props) {
    super(props);

    this.state = { relativeTime: '' };
  }
  componentDidMount() {
    this.interval = setInterval(this.updateTime.bind(this), 60000);
  }

  componentWillReceiveProps() {
    clearInterval(this.interval);
    this.updateTime();
    this.interval = setInterval(this.updateTime.bind(this), 60000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <time>{this.state.relativeTime}</time>
    )
  }

  updateTime() {
    let tweet = this.props.tweet;
    let t = new Date(Date.parse(tweet.created_at));
    this.setState({ relativeTime: Moment(t).fromNow() });
  }
}