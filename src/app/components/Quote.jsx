import React from 'react';
import Time from './Time';

export default class Quote extends React.Component {
  render() {
    return (
      <div>
        <h1>@{this.props.quote.user.name} <Time quote={this.props.quote} /></h1>
        <p>{this.props.quote.text}</p>
      </div>
    )
  }
}