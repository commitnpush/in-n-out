import moment from 'moment';
export function statusCodeToMsg(code) {
  let msg = '';
  switch (code) {
  case 0:
    msg = '출근 전';
    break;
  case 1:
    msg = '출근 후';
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
  console.log(employee_info);
  //출근 전 - 0;
  //출근 후 - 1;
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
    if (moment(lastHistory.in, 'HH:mm') >= moment(employee_info.in, 'HH:mm')) {
      return 2;
    }
    return 1;
  }

  //퇴근버튼 누름
  //자율출퇴근
  if (employee_info.is_free) {
    //일한시간이 일해야하는 시간보다 큼 -> 퇴근
    if (
      moment(lastHistory.out, 'HH:mm') - moment(lastHistory.in, 'HH:mm') >=
      employee_info.duty * 60 * 1000
    ) {
      return 5;
    }
    //부족
    return 4;
  }

  //퇴근시간이 퇴근해야하는 시간보다 이후 -> 퇴근
  if (moment(lastHistory.out, 'HH:mm') >= moment(employee_info.out, 'HH:mm')) {
    return 6;
  }
  //이미 지각
  if (moment(lastHistory.in, 'HH:mm') >= moment(employee_info.in, 'HH:mm')) {
    return 5;
  }
  //조퇴
  return 3;
}
