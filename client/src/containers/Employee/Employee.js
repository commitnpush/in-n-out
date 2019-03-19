import React, { Component } from 'react';
import './Employee.scss';
import { connect } from 'react-redux';
import { historyRequest, inRequest, outRequest } from 'modules/history';
import { Clock } from 'components';
import moment from 'moment';

import M from 'materialize-css';
class Employee extends Component {
  state = {
    todayStatus: '',
    workingMinute: 0
  };
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
  _todayStatus = nextProps => {
    const { in: inTime, out: outTime } = nextProps.history.data[0];
    const is_free = nextProps.info.employee_info.is_free;
    //자율출퇴근제 O
    if (is_free) {
      let duty = nextProps.info.employee_info.duty;

      //출근 도장 전
      if (inTime === '') {
        return '출근 전';
      }

      //출근 도장 후 퇴근 도장 전
      if (outTime === '') {
        return '출근 중';
      }

      //퇴근 도장 후
      //퇴근시간 - 출근시간 < 근무시간 => 미달
      if (
        moment(outTime, 'HH:mm') - moment(inTime, 'HH:mm') <
        duty * 60 * 1000
      ) {
        return '미달';
      }

      return '정상 퇴근';
    }
    const { in: inDuty, out: outDuty } = nextProps.info.employee_info;

    //자율출퇴근제 X
    //출근 도장 전
    if (inTime === '') {
      //출근해야할 시간이 지남
      if (moment(inDuty, 'HH:mm') < moment()) {
        return '지각';
      }
      return '출근 전';
    }

    //출근 도장 후, 퇴근 도장 전
    if (outTime === '') {
      if (moment(inDuty, 'HH:mm') < moment(inTime, 'HH:mm')) {
        return '지각';
      }
      return '출근 중';
    }
    //퇴근 도장 후
    //조퇴 체크
    if (moment(outDuty, 'HH:mm') > moment(outTime, 'HH:mm')) {
      if (moment(inDuty, 'HH:mm') < moment(inTime, 'HH:mm')) {
        return '지각 + 조퇴';
      }
      return '조퇴';
    }
    //지각 체크
    if (moment(inDuty, 'HH:mm') < moment(inTime, 'HH:mm')) {
      return '지각';
    }
    return '정상 퇴근';
  };
  componentDidMount() {
    this.props.historyRequest(this.props.info.username).then(() => {
      if (this.props.history.status === 'FAILURE') {
        console.log('mount', this.props.history);
        M.toast({ html: this.props.history.error.msg });
      }
      //1분마다 렌더링
      if (this.props.info.employee_info.is_free) {
        this.setState({
          workingMinute: getWorkingMinute(
            this.props.history.data[0].in,
            this.props.history.data[0].out
          )
        });
        this.interval = setInterval(() => {
          this.setState({
            workingMinute: getWorkingMinute(
              this.props.history.data[0].in,
              this.props.history.data[0].out
            )
          });
        }, 1000 * 60);
      }
    });
  }

  componentWillUnmount() {
    if (this.workingMinuteInterval) {
      clearInterval(this.workingMinuteInterval);
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ todayStatus: this._todayStatus(nextProps) });
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
            history={this.props.history}
            todayStatus={this.state.todayStatus}
            workingMinute={this.state.workingMinute}
          />
        </div>
      </div>
    );
  }
}

function getStatusColor(status) {
  let statusColor = 'grey';
  switch (status) {
  case '출근 전':
    break;
  case '지각':
  case '조퇴':
  case '미달':
  case '결근':
    statusColor = 'red';
    break;
  case '출근 중':
    statusColor = 'blue';
    break;
  default:
    statusColor = 'teal';
  }
  return statusColor;
}
function ProfileBox(props) {
  const todayStatusColor = getStatusColor(props.todayStatus);
  let thisWeekStatus = getThisWeekStatus(
    props.history.data,
    props.info.employee_info
  );

  return (
    <div className="profile-box">
      <div className="card">
        <div className="card-content">
          <div className="profile-header">
            <img src={`/profile/${props.info.username}`} alt="profile" />
            <div className="profile-username">{props.info.username}</div>
            <div className="today-status">
              <div className={`content ${todayStatusColor}`}>
                {props.todayStatus}
              </div>
            </div>
          </div>

          <div className="card-row">
            <div className="title">Information</div>
            <div className="content">
              <table className="centered">
                <thead>
                  {props.info.employee_info.is_free ? (
                    <tr>
                      <th>담당자</th>
                      <th>근무시간(분)</th>
                      <th>근무한 시간</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>담당자</th>
                      <th>출근시간</th>
                      <th>퇴근시간</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {props.info.employee_info.is_free ? (
                    <tr>
                      <td>{props.info.employee_info.manager}</td>
                      <td>{props.info.employee_info.duty}</td>
                      <td>{props.workingMinute}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td>{props.info.employee_info.manager}</td>
                      <td>{props.info.employee_info.in}</td>
                      <td>{props.info.employee_info.out}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-row">
            <div className="title">This week</div>
            <div className="content">
              <table className="centered">
                <thead>
                  <tr>
                    <th>Mon</th>
                    <th>Thu</th>
                    <th>Wed</th>
                    <th>Thd</th>
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
      </div>
    </div>
  );
}
function getWorkingMinute(inTime, outTime) {
  if (inTime === '') {
    return 0;
  }
  if (outTime === '') {
    return Math.floor((moment() - moment(inTime, 'HH:mm')) / 1000 / 60);
  }
  return Math.floor(
    (moment(outTime, 'HH:mm') - moment(inTime, 'HH:mm')) / 1000 / 60
  );
}
function getThisWeekStatus(historyData, employee_info) {
  //기준날짜
  let today = moment().startOf('day');
  let thisMonday = moment().startOf('isoWeek');
  const thisWeekStatus = [];
  if (historyData.length === 1) {
    return thisWeekStatus;
  }
  for (let i = 1; i < historyData.length; i++) {
    //날짜가 이번주 월요일보다 이전일 경우
    if (thisMonday > moment(historyData[i].created)) {
      break;
    }
    //기준 날짜를 하루 전으로 이동
    today = today.subtract(1, 'days');
    //출퇴근 내역이 없을 경우
    if (moment(historyData[i].created) < today) {
      i--;
      thisWeekStatus.unshift('결근');
      continue;
    }

    let status = getStatusFromTime(
      historyData[i].in,
      historyData[i].out,
      employee_info
    );
    //thisWeekStatus.push(historyData[i].status);
    thisWeekStatus.unshift(status);
  }
  return thisWeekStatus;
}

function getStatusFromTime(inTime, outTime, employee_info) {
  if (inTime === '') {
    return '결근';
  }
  //자율출퇴근제
  if (employee_info.is_free) {
    if (
      moment(outTime, 'HH:mm') - moment(inTime, 'HH:mm') <
      employee_info.duty * 60 * 1000
    ) {
      return '미달';
    }
    return '정상 퇴근';
  }

  const { in: inDuty, out: outDuty } = employee_info;
  if (moment(outDuty, 'HH:mm') > moment(outTime, 'HH:mm')) {
    if (moment(inDuty, 'HH:mm') < moment(inTime, 'HH:mm')) {
      return '지각 + 조퇴';
    }
    return '조퇴';
  }
  //지각 체크
  if (moment(inDuty, 'HH:mm') < moment(inTime, 'HH:mm')) {
    return '지각';
  }
  return '정상 퇴근';
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
