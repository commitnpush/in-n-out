import moment from 'moment';
import './ProfileBox.scss';
import React, { Component } from 'react';
import M from 'materialize-css';
import { connect } from 'react-redux';
import { employeeEditRequest } from 'modules/manage';
import {
  getCurrentStatus,
  statusCodeToMsg,
  statusCodeToColor,
  getThisWeekStatus,
  getWorkingMinute,
  getStatusColor
} from 'utils/history';

import PropTypes from 'prop-types';

class ProfileBox extends Component {
  state = {
    editMode: false,
    info: this.props.info,
    todayHistory: null,
    isLoggedIn: false
  };
  _handleEditModeToggle = () => {
    this.setState(prevState => ({
      editMode: !prevState.editMode,
      info: this.props.info
    }));
  };
  _handleEmployeeInfoChange = e => {
    let key = e.target.name;
    let value = e.target.value;
    this.setState(prevState => ({
      info: {
        ...prevState.info,
        employee_info: {
          ...prevState.info.employee_info,
          [key]: key === 'duty' ? Number(value) : value
        }
      }
    }));
  };
  _handleTodayHistoryChange = e => {
    let key = e.target.name === 'inTime' ? 'in' : 'out';
    let value = e.target.value;
    this.setState(prevState => ({
      todayHistory: {
        ...prevState.todayHistory,
        [key]: value
      }
    }));
  };
  _handleAlertForEditManager = () => {
    M.toast({
      html: '담당자를 변경할 경우 해당 사원을 더이상 관리할 수 없습니다',
      classes: 'warn',
      displayLength: 2000
    });
  };
  _handleEmployeeEdit = () => {
    const newHistories = JSON.parse(JSON.stringify(this.state.info.histories));
    if (this.state.isLoggedIn) {
      newHistories[0] = this.state.todayHistory;
    } else {
      newHistories.unshift(this.state.todayHistory);
    }
    this.setState(
      prevState => ({
        info: {
          ...prevState.info,
          histories: newHistories
        }
      }),
      () => {
        this.props
          .employeeEditRequest(this.state.info, this.props.index)
          .then(() => {
            if (this.props.edit.status === 'FAILURE') {
              M.toast({
                html: this.props.edit.error.msg,
                classes: 'error',
                displayLength: 2000
              });
              if (this.props.edit.error.property) {
                for (let inputTag of document.querySelectorAll('[name]')) {
                  inputTag.classList.remove('invalid');
                }
                document
                  .querySelector(`[name=${this.props.edit.error.property}]`)
                  .classList.add('invalid');
              }
            }
          });
      }
    );
  };
  componentWillMount() {
    if (
      this.props.histories.length !== 0 &&
      moment(this.props.histories[0].created) > moment().startOf('day')
    ) {
      this.setState({
        todayHistory: this.props.histories[0],
        isLoggedIn: true
      });
    } else {
      this.setState({
        todayHistory: {
          in: '',
          out: '',
          username: this.props.info.username,
          created: moment()
        }
      });
    }
  }
  _handleTimePicker(hour, minute, type) {
    this.setState(prevState => ({
      info: {
        ...prevState.info,
        employee_info: {
          ...prevState.info.employee_info,
          [type]: `${hour < 10 ? '0' + hour : hour}:${
            minute < 10 ? '0' + minute : minute
          }`
        }
      }
    }));
  }
  _handleHistoryTimePicker(hour, minute, type) {
    this.setState(prevState => ({
      todayHistory: {
        ...prevState.todayHistory,
        [type]: `${hour < 10 ? '0' + hour : hour}:${
          minute < 10 ? '0' + minute : minute
        }`
      }
    }));
  }
  componentWillReceiveProps(nextProps) {
    if (
      this.props.histories.length !== 0 &&
      moment(nextProps.histories[0].created) > moment().startOf('day')
    ) {
      this.setState({
        todayHistory: nextProps.histories[0],
        isLoggedIn: true
      });
    } else {
      this.setState({
        todayHistory: {
          in: '',
          out: '',
          username: nextProps.info.username,
          created: moment()
        }
      });
    }
    if (nextProps.edit.status === 'SUCCESS') {
      this.setState({ editMode: false });
    }
  }

  componentDidUpdate() {
    if (!this.state.editMode) return;
    const in_element = document.querySelector('[name=inTime]');
    const in_instance = M.Timepicker.init(in_element, {
      twelveHour: false,
      autoClose: true,
      defaultTime: this.state.todayHistory.in || '09:00',
      onCloseEnd: () => {
        this._handleHistoryTimePicker(
          in_instance.hours,
          in_instance.minutes,
          'in'
        );
      }
    });

    const out_element = document.querySelector('[name=outTime]');
    const out_instance = M.Timepicker.init(out_element, {
      twelveHour: false,
      autoClose: true,
      defaultTime: this.state.todayHistory.out || '18:00',
      onCloseEnd: () => {
        this._handleHistoryTimePicker(
          out_instance.hours,
          out_instance.minutes,
          'out'
        );
      }
    });
    if (!this.state.info.employee_info.is_free) {
      const in_element = document.querySelector('[name=in]');
      const in_instance = M.Timepicker.init(in_element, {
        twelveHour: false,
        autoClose: true,
        defaultTime: this.state.info.employee_info.in,
        onCloseEnd: () => {
          this._handleTimePicker(in_instance.hours, in_instance.minutes, 'in');
        }
      });

      const out_element = document.querySelector('[name=out]');
      const out_instance = M.Timepicker.init(out_element, {
        twelveHour: false,
        autoClose: true,
        defaultTime: this.state.info.employee_info.out,
        onCloseEnd: () => {
          this._handleTimePicker(
            out_instance.hours,
            out_instance.minutes,
            'out'
          );
        }
      });
    }
  }

  render() {
    const status = getCurrentStatus(
      this.props.info.employee_info,
      this.props.histories
    );
    const msg = statusCodeToMsg(status);
    const color = statusCodeToColor(status);
    let thisWeekStatus = getThisWeekStatus(
      this.props.histories,
      this.props.info.employee_info,
      this.props.info.created
    );

    let workingTime = 0;
    //로그인 했다면
    if (
      this.props.histories.length !== 0 &&
      moment(this.props.histories[0].created) > moment().startOf('day')
    ) {
      workingTime = getWorkingMinute(
        this.props.histories[0].in,
        this.props.histories[0].out || moment().format('HH:mm')
      );
    }

    const normalView = (
      <div className="normalView">
        <div className="card-row">
          <div className="title">Information</div>
          <div className="content">
            <table className="centered responsive">
              <thead>
                {this.props.info.employee_info.is_free ? (
                  <tr>
                    {!this.props.inManager && <th>담당자</th>}
                    <th>근무시간(분)</th>
                    {this.props.inManager && <th>출근한 시간</th>}
                    {this.props.inManager && <th>퇴근한 시간</th>}
                    <th>근무한 시간</th>
                  </tr>
                ) : (
                  <tr>
                    {!this.props.inManager && <th>담당자</th>}
                    <th>출근시간</th>
                    <th>퇴근시간</th>
                    {this.props.inManager && <th>출근한 시간</th>}
                    {this.props.inManager && <th>퇴근한 시간</th>}
                  </tr>
                )}
              </thead>
              <tbody>
                {this.props.info.employee_info.is_free ? (
                  <tr>
                    {!this.props.inManager && (
                      <td>{this.props.info.employee_info.manager}</td>
                    )}
                    <td>{this.props.info.employee_info.duty}</td>
                    {this.props.inManager && (
                      <td>{this.state.todayHistory.in}</td>
                    )}
                    {this.props.inManager && (
                      <td>{this.state.todayHistory.out}</td>
                    )}
                    <td>{workingTime}</td>
                  </tr>
                ) : (
                  <tr>
                    {!this.props.inManager && (
                      <td>{this.props.info.employee_info.manager}</td>
                    )}
                    <td>{this.props.info.employee_info.in}</td>
                    <td>{this.props.info.employee_info.out}</td>
                    {this.props.inManager && (
                      <td>{this.state.todayHistory.in}</td>
                    )}
                    {this.props.inManager && (
                      <td>{this.state.todayHistory.out}</td>
                    )}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-row">
          <div className="title">This week</div>
          <div className="content">
            <table className="centered responsive">
              <thead>
                <tr>
                  <th>Mon</th>
                  <th>Tue</th>
                  <th>Wed</th>
                  <th>Thu</th>
                  <th>Fri</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {thisWeekStatus.map((v, i) => {
                    return (
                      <td key={i}>
                        <span className={`status ${getStatusColor(v)}`}>
                          {v}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
    const editView = (
      <div className="editView">
        <div className="card-row">
          <div className="title">Information</div>
          <div className="content">
            <table className="centered responsive">
              <thead>
                {this.props.info.employee_info.is_free ? (
                  <tr>
                    <th>담당자</th>
                    <th>근무시간(분)</th>
                    <th>출근한 시간</th>
                    <th>퇴근한 시간</th>
                  </tr>
                ) : (
                  <tr>
                    <th>담당자</th>
                    <th>출근시간</th>
                    <th>퇴근시간</th>
                    <th>출근한 시간</th>
                    <th>퇴근한 시간</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {this.props.info.employee_info.is_free ? (
                  <tr>
                    <td>
                      <input
                        type="text"
                        name="manager"
                        onChange={this._handleEmployeeInfoChange}
                        onFocus={this._handleAlertForEditManager}
                        value={this.state.info.employee_info.manager}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="duty"
                        onChange={this._handleEmployeeInfoChange}
                        value={this.state.info.employee_info.duty}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="inTime"
                        onChange={this._handleTodayHistoryChange}
                        value={this.state.todayHistory.in}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="outTime"
                        onChange={this._handleTodayHistoryChange}
                        value={this.state.todayHistory.out}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td>
                      <input
                        type="text"
                        name="manager"
                        onChange={this._handleEmployeeInfoChange}
                        onFocus={this._handleAlertForEditManager}
                        value={this.state.info.employee_info.manager}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="in"
                        onChange={this._handleEmployeeInfoChange}
                        value={this.state.info.employee_info.in}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="out"
                        onChange={this._handleEmployeeInfoChange}
                        value={this.state.info.employee_info.out}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="inTime"
                        onChange={this._handleTodayHistoryChange}
                        value={this.state.todayHistory.in}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="outTime"
                        onChange={this._handleTodayHistoryChange}
                        value={this.state.todayHistory.out}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="footer">
            <a
              className="waves-effect waves-light btn"
              onClick={this._handleEmployeeEdit}
            >
              수정
            </a>
          </div>
        </div>
      </div>
    );

    return (
      <div className="profile-box">
        <div className="card">
          {this.props.inManager && (
            <div className="more">
              <a
                className="refresh"
                onClick={this.props.onRefresh}
                title="로고침"
              >
                <i className="material-icons">refresh</i>
              </a>
              <a
                className="edit"
                onClick={this._handleEditModeToggle}
                title="수정"
              >
                <i className="material-icons">
                  {this.state.editMode ? 'reply' : 'edit'}
                </i>
              </a>
              <a className="close" onClick={this.props.onClose} title="닫기">
                <i className="material-icons">close</i>
              </a>
            </div>
          )}
          <div className="card-content">
            <div className="profile-header">
              <div className="thumbnail-wrapper">
                <div className="thumbnail">
                  <div className="centered">
                    <img
                      src={`/profile/${this.props.info.username}`}
                      alt="profile"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-username">
                <div className="content">{this.props.info.username}</div>
              </div>
              <div className="today-status">
                <span className="label">today</span>
                <span className={`content ${color}`}>{msg}</span>
              </div>
            </div>
            {this.state.editMode ? editView : normalView}
          </div>
        </div>
      </div>
    );
  }
}

ProfileBox.propTypes = {};
ProfileBox.defaultProps = {};

const mapStateToProps = state => ({
  edit: state.manage.edit
});

const mapDispatchToProps = dispatch => ({
  employeeEditRequest: (employee, index) => {
    return dispatch(employeeEditRequest(employee, index));
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileBox);
