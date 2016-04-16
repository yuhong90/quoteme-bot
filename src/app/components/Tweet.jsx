import React from 'react';
import Time from './Time';

export default class Tweet extends React.Component {
  render() {
    return (
      <div>
        <h1>@{this.props.tweet.user.name} <time>{this.props.tweet.formattedTime} | </time><Time tweet={this.props.tweet} /></h1>
        <p>{this.props.tweet.text}</p>
      </div>
    )
  }
}