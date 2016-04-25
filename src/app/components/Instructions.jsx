import React from 'react';

export default class Instructions extends React.Component {
  render() {
    return (
      <span className="instructions">To send stuff to the board, talk to <span className="emphasis">@hive_speaker_bot</span> on Telegram!</span>
    )
  }
}