import React, { Component } from 'react';
import './Clock.scss';
import moment from 'moment';

class Clock extends Component {
  state = {
    time: moment().format('HH : mm : ss')
  };
  interval = null;
  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState({
        time: moment().format('HH : mm : ss')
      });
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    return <div className="clock">{this.state.time}</div>;
  }
}

Clock.propTypes = {};
Clock.defaultProps = {};
export default Clock;
