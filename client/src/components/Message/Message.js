import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import './Message.scss';

class Message extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    //성능최적화
    //isNewDate가 변경되지 않는 이상 랜더링x
    return this.props.isNewDate !== nextProps.isNewDate;
  }
  render() {
    const { message, username } = this.props;
    const isMine = message.writer === username;
    return (
      <div className={`message ${this.props.isNewDate && 'new-date'}`}>
        {this.props.isNewDate && (
          <div className="new-date">
            <hr />
            <span className="date">
              {moment(message.created).format('YYYY[년] MM[월] DD[일]')}
            </span>
          </div>
        )}
        <div className={`message-container ${isMine && 'is-mine'}`}>
          {!isMine && (
            <div className="profile">
              <div className="thumbnail-wrapper">
                <div className="thumbnail">
                  <img src={`/profile/${message.writer}`} alt="" />
                </div>
              </div>
            </div>
          )}
          <div className="message-body">
            {!isMine && <div className="writer">{message.writer}</div>}
            <div className="content">
              <div className="tail" />
              <div className="msg">
                <pre>{message.content}</pre>
              </div>
              <div className="created">
                {moment(message.created).format('a hh:mm')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Message.propTypes = {
  message: PropTypes.object,
  username: PropTypes.string
};
Message.defaultProps = {
  message: {},
  username: ''
};
export default Message;
