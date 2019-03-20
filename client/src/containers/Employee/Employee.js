import React, { Component } from 'react';
import './Employee.scss';
import { connect } from 'react-redux';
import { historyRequest, inRequest, outRequest } from 'modules/history';
import { Clock, ProfileBox } from 'components';

import M from 'materialize-css';
class Employee extends Component {
  workingMinuteInterval = null;
  _inHandler = () => {
    this.props.inRequest().then(() => {
      if (this.props.in.status === 'FAILURE') {
        M.toast({ html: this.props.in.error.msg, displayLength: 2000 });
      }
    });
  };
  _outHandler = () => {
    if (this.props.history.data[0].in === '') {
      M.toast({ html: '출근부터 하셔야죠?', displayTime: 1000 });
      return;
    }
    this.props.outRequest().then(() => {
      if (this.props.in.status === 'FAILURE') {
        M.toast({ html: this.props.in.error.msg, displayLength: 2000 });
      }
    });
  };
  componentDidMount() {
    this.props.historyRequest(this.props.info.username).then(() => {
      if (this.props.history.status === 'FAILURE') {
        M.toast({ html: this.props.history.error.msg });
      }
    });
  }

  componentWillUnmount() {
    if (this.workingMinuteInterval) {
      clearInterval(this.workingMinuteInterval);
    }
  }
  render() {
    const { history } = this.props;
    const today = this.props.history.data[0];
    if (history.status !== 'SUCCESS') return <div />;

    const buttonBox = (
      <div className="button-box center mt-70">
        <Clock />
        <div className="col s12 m6">
          <div className="button-box">
            <a
              className="waves-effect waves-light btn-large blue"
              disabled={today.in}
              onClick={this._inHandler}
            >
              출근했어요{' '}
              {today.in && <span className="time">[{today.in}]</span>}
            </a>
          </div>
        </div>
        <div className="col s12 m6">
          <div className="button-box">
            <a
              className="waves-effect waves-light btn-large red lighten-1"
              onClick={this._outHandler}
              disabled={today.out}
            >
              퇴근할께요{' '}
              {today.out && <span className="time">[{today.out}]</span>}
            </a>
          </div>
        </div>
      </div>
    );

    return (
      <div className="mt-70 container">
        <div className="row">{buttonBox}</div>
        <div className="row">
          <ProfileBox
            info={this.props.info}
            histories={this.props.history.data}
            inManager={false}
          />
        </div>
      </div>
    );
  }
}

Employee.propTypes = {};
Employee.defaultProps = {};

const mapStateToProps = state => ({
  info: state.auth.info,
  history: state.history.history,
  in: state.history.in,
  out: state.history.out
});

const mapDispatchToProps = dispatch => ({
  historyRequest: () => {
    return dispatch(historyRequest());
  },
  inRequest: () => {
    return dispatch(inRequest());
  },
  outRequest: () => {
    return dispatch(outRequest());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Employee);
