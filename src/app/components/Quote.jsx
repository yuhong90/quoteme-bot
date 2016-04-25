import React from 'react';
import Time from './Time';

export default class Quote extends React.Component {
  render() {
    return (
      <div className="alignVert quote-container">
        <div className="left">
          <img className="profilePhoto" src={this.props.quote.user.profilePic} />
        </div>
        <div className="right">
          <h1>@{this.props.quote.user.name} <Time quote={this.props.quote} /></h1>
          <p>{this.props.quote.text}</p>
          <img className="photo" src={this.props.quote.photo}/>
        </div>
      </div>
    )
  }
}