import moment from 'moment';
export function statusCodeToMsg(code) {
  let msg = '';
  switch (code) {
  case 0:
    msg = '출근 전';
    break;
  case 1:
    msg = '출근 중';
    break;
  case 2:
    msg = '지각';
    break;
  case 3:
    msg = '조퇴';
    break;
  case 4:
    msg = '부족';
    break;
  case 5:
    msg = '지각조퇴';
    break;
  default:
    msg = '퇴근';
  }
  return msg;
}

export function statusCodeToColor(code) {
  let color = '';
  switch (code) {
  case 0:
  case 1:
    color = 'blue';
    break;
  case 2:
  case 3:
  case 4:
  case 5:
    color = 'red';
    break;
  default:
    color = 'teal';
  }
  return color;
}

export function getCurrentStatus(employee_info, histories) {
  //출근 전 - 0;
  //출근 중 - 1;
  //지각 - 2;
  //조퇴 - 3;
  //부족 - 4;
  //퇴근 - 5;

  //입사 후 한번도 로그인 안함 -> 출근 전
  if (histories.length === 0) {
    return 0;
  }
  var lastHistory = histories[0];
  //로그인 전 -> 출근 전
  if (moment(lastHistory.created) < moment().startOf('day')) {
    return 0;
  }
  //로그인은 했지만 출근버튼 안눌렀을 때
  if (lastHistory.in === '') {
    //자율출퇴근 -> 출근 전
    if (employee_info.is_free) {
      return 0;
    }
    //현재시간보다 출근해야하는 시간이 이후 -> 출근 전
    if (moment() <= moment(employee_info.in, 'HH:mm')) {
      return 0;
    }
    //지각
    return 2;
  }
  //출근버튼 누름 & 퇴근 버튼 안 누름
  if (lastHistory.out === '') {
    //자율출퇴근 -> 출근 중
    if (employee_info.is_free) {
      return 1;
    }
    //출근은 했지만 출근시간보다 출근해야하는 시간이 이전 -> 지각
    if (moment(lastHistory.in, 'HH:mm') > moment(employee_info.in, 'HH:mm')) {
      return 2;
    }
    return 1;
  }

  //퇴근버튼 누름

  //출근은 했지만 출근시간보다 출근해야하는 시간이 이전 -> 지각
  if (moment(lastHistory.in, 'HH:mm') > moment(employee_info.in, 'HH:mm')) {
    return 2;
  }

  //자율출퇴근
  if (employee_info.is_free) {
    //일한시간이 일해야하는 시간보다 큼 -> 퇴근
    if (
      moment(lastHistory.out, 'HH:mm') - moment(lastHistory.in, 'HH:mm') >=
      employee_info.duty * 60 * 1000
    ) {
      return 6;
    }
    //부족
    return 4;
  }

  //퇴근시간이 퇴근해야하는 시간보다 이후 -> 퇴근
  if (moment(lastHistory.out, 'HH:mm') >= moment(employee_info.out, 'HH:mm')) {
    return 6;
  }
  //이미 지각 + 조퇴
  if (moment(lastHistory.in, 'HH:mm') > moment(employee_info.in, 'HH:mm')) {
    return 5;
  }
  //조퇴
  return 3;
}

export function getWorkingMinute(inTime, outTime) {
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

export function getStatusColor(status) {
  let statusColor = 'grey';
  switch (status) {
  case '지각':
  case '조퇴':
  case '지각조퇴':
  case '부족':
  case '결근':
    statusColor = 'red';
    break;
  case '출근 전':
  case '입사 전':
  case '출근 중':
    statusColor = 'blue';
    break;
  default:
    statusColor = 'teal';
  }
  return statusColor;
}

export function getThisWeekStatus(historyData, employee_info, created) {
  //기준날짜
  let date = moment()
    .subtract(1, 'days')
    .startOf('day');
  //이번주 월요일
  let thisMonday = moment().startOf('isoWeek');
  let historyIndex = 0;
  const thisWeekStatus = [];

  while (date >= thisMonday) {
    //더이상 로그인 기록이 없거나 최근히스토리가 기준날짜보다 작을 경우
    if (
      typeof historyData[historyIndex] === 'undefined' ||
      moment(historyData[historyIndex].created) < date
    ) {
      //입사일이 기준날짜보다 이전일 경우 -> 결근
      if (moment(created) < date) {
        thisWeekStatus.unshift('결근');
      } else {
        thisWeekStatus.unshift('입사 전');
      }

      //기록이 오늘일경우
    } else if (
      moment(historyData[historyIndex].created) > moment().startOf('day')
    ) {
      historyIndex++;
      continue;
    } else {
      let status = getStatusFromTime(
        historyData[historyIndex].in,
        historyData[historyIndex].out,
        employee_info
      );
      historyIndex++;
      thisWeekStatus.unshift(status);
    }
    date.subtract(1, 'days');
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
      return '부족';
    }
    return '퇴근';
  }

  const { in: inDuty, out: outDuty } = employee_info;
  if (moment(outDuty, 'HH:mm') > moment(outTime, 'HH:mm')) {
    if (moment(inDuty, 'HH:mm') < moment(inTime, 'HH:mm')) {
      return '지각조퇴';
    }
    return '조퇴';
  }
  //지각 체크
  if (moment(inDuty, 'HH:mm') < moment(inTime, 'HH:mm')) {
    return '지각';
  }
  return '퇴근';
}
