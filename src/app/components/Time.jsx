import React from 'react';
import Moment from 'moment';

export default class Time extends React.Component {
  constructor(props) {
    super(props);

    this.state = { relativeTime: '' };
  }

  componentWillMount() {
    this.updateTime();
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
    let quote = this.props.quote;
    let t = new Date(Date.parse(quote.created_at));
    this.setState({ relativeTime: Moment(t).fromNow() });
  }
}