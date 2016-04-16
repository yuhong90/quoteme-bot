import React from 'react';
import Time from './Time';

export default class Quote extends React.Component {
  render() {
    return (
      <div>
        <div><img className="profilePhoto" src={this.props.quote.photo} /></div>
        <h1>@{this.props.quote.user.name} <Time quote={this.props.quote} /></h1>
        <p>{this.props.quote.text}</p>
      </div>
    )
  }
}