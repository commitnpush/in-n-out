import moment from 'moment';
import './ProfileBox.scss';
import React from 'react';
import {
  getCurrentStatus,
  statusCodeToMsg,
  statusCodeToColor
} from 'utils/history';

export default function ProfileBox(props) {
  const status = getCurrentStatus(props.info.employee_info, props.histories);
  console.log(status);
  const msg = statusCodeToMsg(status);
  const color = statusCodeToColor(status);
  let thisWeekStatus = getThisWeekStatus(
    props.histories,
    props.info.employee_info
  );

  let workingTime = 0;
  let todayHistory = {};
  //로그인 했다면
  if (moment(props.histories[0].create) > moment().startOf('day')) {
    workingTime = getWorkingMinute(
      props.histories[0].in,
      props.histories[0].out
    );
    todayHistory = props.histories[0];
  } else {
    todayHistory = { in: '', out: '' };
  }

  return (
    <div className="profile-box">
      <div className="card">
        {props.inManager && (
          <a className="refresh" onClick={props.onRefresh}>
            <i className="material-icons">refresh</i>
          </a>
        )}
        <div className="card-content">
          <div className="profile-header">
            <div className="thumbnail-wrapper">
              <div className="thumbnail">
                <div className="centered">
                  <img src={`/profile/${props.info.username}`} alt="profile" />
                </div>
              </div>
            </div>

            <div className="profile-username">
              <div className="content">{props.info.username}</div>
            </div>
            <div className="today-status">
              <span className="label">today</span>
              <span className={`content ${color}`}>{msg}</span>
            </div>
          </div>

          <div className="card-row">
            <div className="title">Information</div>
            <div className="content">
              <table className="centered">
                <thead>
                  {props.info.employee_info.is_free ? (
                    <tr>
                      {!props.inManager && <th>담당자</th>}
                      <th>근무시간(분)</th>
                      {props.inManager && <th>출근한 시간</th>}
                      {props.inManager && <th>퇴근한 시간</th>}
                      <th>근무한 시간</th>
                    </tr>
                  ) : (
                    <tr>
                      {!props.inManager && <th>담당자</th>}
                      <th>출근시간</th>
                      <th>퇴근시간</th>
                      {props.inManager && <th>출근한 시간</th>}
                      {props.inManager && <th>퇴근한 시간</th>}
                    </tr>
                  )}
                </thead>
                <tbody>
                  {props.info.employee_info.is_free ? (
                    <tr>
                      {!props.inManager && (
                        <td>{props.info.employee_info.manager}</td>
                      )}
                      <td>{props.info.employee_info.duty}</td>
                      {props.inManager && <td>{todayHistory.in}</td>}
                      {props.inManager && <td>{todayHistory.out}</td>}
                      <td>{workingTime}</td>
                    </tr>
                  ) : (
                    <tr>
                      {!props.inManager && (
                        <td>{props.info.employee_info.manager}</td>
                      )}
                      <td>{props.info.employee_info.in}</td>
                      <td>{props.info.employee_info.out}</td>
                      {props.inManager && <td>{todayHistory.in}</td>}
                      {props.inManager && <td>{todayHistory.out}</td>}
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
    return '퇴근';
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
