import React, { Component } from 'react';
import { Thumbnail, MessageList } from 'components';
import Loader from 'react-loader-spinner';
import { connect } from 'react-redux';
import M from 'materialize-css';
import './Chat.scss';
import socketio from 'socket.io-client';
import moment from 'moment';
import update from 'react-addons-update';

class Chat extends Component {
  isAlt = false;
  socket = null;
  state = {
    room: null,
    message: '',
    username: this.props.info.username,
    loading: false
  };
  _scrollHandler = e => {
    //스크롤이 상단에 근접
    if (e.target.scrollTop < 10) {
      //현재 로딩중이면 무시
      if (this.state.loading) {
        return;
      }

      this.setState({ loading: true }, () => {
        //너무 잦은 불러오기 방지
        setTimeout(() => {
          this.socket.emit('more', {
            manager: this.state.room.manager,
            index: this.state.room.messages.length
          });
        }, 250);
      });
    }
  };
  _keyUpHandler = e => {
    if (e.which === 18) {
      this.isAlt = false;
    }
  };
  _keyDownHandler = e => {
    if (e.which === 18) {
      this.isAlt = true;
      return;
    }
    if (e.which === 13 && this.isAlt) {
      //줄바꿈
      this.setState(
        prevState => ({
          message: prevState.message + '\n'
        }),
        () => {
          //스크롤 가장 아래로
          document.getElementById(
            'messages'
          ).scrollTop = document.getElementById('messages').scrollHeight;
        }
      );
      return;
    }
    if (e.keyCode === 13) {
      this._msgSendHandler();
      e.preventDefault();
    }
  };
  _msgSendHandler = e => {
    //공백 및 줄바꿈제거 후 내용어 없으면 리턴
    if (
      this.state.message
        .replace(/\n/g, '')
        .replace(/^\s+/, '')
        .replace(/\s+$/, '') === ''
    ) {
      return;
    }
    this.socket.emit('send', {
      writer: this.props.info.username,
      content: this.state.message,
      created: moment().format()
    });

    this.setState(
      {
        message: ''
      },
      () => {}
    );
  };
  _msgChangeHandler = e => {
    this.setState({
      message: e.target.value
    });
  };
  _initSocket = () => {
    this.socket = socketio.connect(process.env.REACT_APP_SOCKET_HOST);
    this.socket.emit('room', {
      username: this.props.info.username,
      type: this.props.info.type
    });
    this.socket.on('room', data => {
      data.messages.sort((a, b) => {
        if (moment(a.created) > moment(b.created)) return 1;
        if (moment(a.created) < moment(b.created)) return -1;
        return 0;
      });
      this.setState({ room: data }, () => {
        //스크롤 제일 아래
        const messagesDiv = document.getElementById('messages');
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      });
    });
    this.socket.on('send', data => {
      this.setState(
        prevState => {
          return update(prevState, {
            room: {
              messages: { $push: [data] }
            }
          });
        },
        () => {
          const messagesDiv = document.getElementById('messages');
          if (
            messagesDiv.scrollHeight -
              messagesDiv.scrollTop -
              messagesDiv.clientHeight <
            150
          ) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          } else {
            M.toast({ html: '새로운 메세지', displayLength: 500 });
          }
        }
      );
    });
    this.socket.on('enter', data => {
      this.setState(prevState =>
        update(prevState, {
          room: {
            members: { $set: data }
          }
        })
      );
    });
    this.socket.on('leave', data => {
      let index = this.state.room.members.map(v => v.username).indexOf(data);
      this.setState(prevState =>
        update(prevState, {
          room: {
            members: {
              [index]: {
                status: { $set: false }
              }
            }
          }
        })
      );
    });
    this.socket.on('more', data => {
      //더 가져올 메세지가 10개 미만이면 리 -> loading은 계속 true이기에 계속 안가져옴
      if (data.length < 10) return;
      const messagesDiv = document.getElementById('messages');
      let beforeScrollHeight = messagesDiv.scrollHeight;
      this.setState(
        prevState =>
          update(prevState, {
            room: {
              messages: { $unshift: data }
            }
          }),
        () => {
          let afterScrollHeight = messagesDiv.scrollHeight;
          messagesDiv.scrollTop += afterScrollHeight - beforeScrollHeight;
          this.setState({
            loading: false
          });
        }
      );
    });
    this.socket.on('exit', data => {
      this.socket = null;
      //
    });
  };
  _disconnectSocket = () => {
    this.socket.emit('leave', this.state.username);
  };
  componentDidMount() {
    window.addEventListener('beforeunload', this._disconnectSocket);
    this._initSocket();
  }
  componentWillUnmount() {
    window.removeEventListener('beforeunload', this._disconnectSocket);
    this._disconnectSocket();
  }

  render() {
    const { room } = this.state;
    if (!room) {
      return (
        <div className="loading-spinner">
          <Loader type="Oval" color="#26a69a" height="50" width="50" />
        </div>
      );
    }
    return (
      <div className="chat mt-70">
        <div className="card">
          <div className="thumbnails">
            {this.state.room.members.map((v, i) => (
              <Thumbnail
                key={i}
                info={{ username: v.username }}
                status={v.status}
              />
            ))}
          </div>
        </div>
        <div className="card chat-box">
          <MessageList
            onScroll={this._scrollHandler}
            messages={this.state.room.messages}
            username={this.props.info.username}
          />
          <InputBox
            onChange={this._msgChangeHandler}
            onSend={this._msgSendHandler}
            onKeyDown={this._keyDownHandler}
            onKeyUp={this._keyUpHandler}
            message={this.state.message}
          />
        </div>
      </div>
    );
  }
}

function InputBox(props) {
  return (
    <div className="input-box">
      <textarea
        className="materialize-textarea"
        type="text"
        onChange={props.onChange}
        onKeyDown={props.onKeyDown}
        onKeyUp={props.onKeyUp}
        value={props.message}
        autoComplete="off"
      />
      <a className="btn" onClick={props.onSend}>
        <i className="material-icons">keyboard_return</i>
      </a>
    </div>
  );
}
Chat.propTypes = {};
Chat.defaultProps = {};

const mapStateToProps = state => ({
  info: state.auth.info
});
export default connect(
  mapStateToProps,
  null
)(Chat);
