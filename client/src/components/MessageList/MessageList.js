import React, { Component } from 'react';
import { Message } from 'components';
import './MessageList.scss';
import PropTypes from 'prop-types';
import moment from 'moment';

class MessageList extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return this.props.messages.length !== nextProps.messages.length;
  }
  render() {
    const mapToComponent = () => {
      let prevDate = '';
      return this.props.messages.map((v, i) => {
        const isNewDate =
          i === 0 ||
          moment(v.created).format('l') !== moment(prevDate).format('l');
        prevDate = v.created;
        return (
          <Message
            key={v._id}
            message={v}
            username={this.props.username}
            isNewDate={isNewDate}
          />
        );
      });
    };
    return (
      <div id="messages" className="messages" onScroll={this.props.onScroll}>
        {mapToComponent()}
      </div>
    );
  }
}

MessageList.propTypes = {
  messages: PropTypes.array,
  username: PropTypes.string,
  onScroll: PropTypes.func
};
MessageList.defaultProps = {
  messages: [],
  username: '',
  onScroll: () => console.log('onScroll is not defined')
};
export default MessageList;
