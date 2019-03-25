import React, { Component } from 'react';
import { employeesRequest } from 'modules/manage';
import { connect } from 'react-redux';
import M from 'materialize-css';
import Loader from 'react-loader-spinner';
import './Manager.scss';
import { ProfileBox } from 'components';
import {
  getCurrentStatus,
  statusCodeToMsg,
  statusCodeToColor
} from 'utils/history';

class Manager extends Component {
  state = {
    index: -1,
    employee: null
  };
  _showEmployeeInfo = e => {
    let id = e.target.id;
    const nextEmployee = this.props.employees.data[id];
    this.setState({
      index: id,
      employee: nextEmployee
    });
  };
  _handleEmployeeRefresh = () => {
    this._getEmployees().then(() => {
      const nextEmployee = this.props.employees.data[this.state.index];
      this.setState({
        employee: nextEmployee
      });
    });
  };
  _getEmployees = () => {
    return this.props.employeesRequest().then(() => {
      if (this.props.employees.status === 'FAILURE') {
        M.toast({ html: this.props.employees.error.msg, displayLength: 1000 });
      }
    });
  };
  _handleProfileBoxClose = () => {
    this.setState({
      index: -1,
      employee: null
    });
  };
  componentDidMount() {
    this._getEmployees();
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.updateType) {
      this.setState({
        index: -1,
        employee: null
      });
      return;
    }
    const nextEmployee = nextProps.employees.data[this.state.index];
    this.setState({
      employee: nextEmployee
    });
  }
  render() {
    const { status, data } = this.props.employees;
    if (status === 'INIT' || status === 'WAITING') {
      return (
        <div className="loading-spinner">
          <Loader type="Oval" color="#26a69a" height="50" width="50" />
        </div>
      );
    }

    const total = data.length;
    const inNOutInfo = getInNOutInfo(data);
    return (
      <div className="mt-70 container">
        <div className="row">
          {/* 오늘의 출퇴근 요약 */}
          <div className="col s12 m12 l6">
            <div className="card">
              <div className="card-content">
                <div className="title">
                  <span>Summary</span>
                </div>
                <div className="summary">
                  <table className="centered">
                    <thead>
                      <tr>
                        <th>총원</th>
                        <th>출근 전</th>
                        <th>출근 중</th>
                        <th>지각</th>
                        <th>조퇴</th>
                        <th>지각조퇴</th>
                        <th>부족</th>
                        <th>퇴근</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{total}</td>
                        <td>{inNOutInfo.beforeIn}</td>
                        <td>{inNOutInfo.afterIn}</td>
                        <td>{inNOutInfo.tardy}</td>
                        <td>{inNOutInfo.early}</td>
                        <td>{inNOutInfo.tardyearly}</td>
                        <td>{inNOutInfo.lack}</td>
                        <td>{inNOutInfo.out}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {/* 출석중인 직원들의 프로필사진 리스트 */}
          <div className="col s12 m12 l6">
            <div className="card">
              <a className="refresh" onClick={this._getEmployees}>
                <i className="material-icons">refresh</i>
              </a>
              <div className="card-content">
                <div className="title">
                  <span>Members</span>
                </div>
                <div className="thumbnails">
                  {data.map((v, i) => (
                    <Thumbnail
                      info={v}
                      key={i}
                      index={i}
                      onClick={this._showEmployeeInfo}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.state.employee != null && (
          <div className="row">
            <div className="col s12">
              <ProfileBox
                index={this.state.index}
                info={this.state.employee}
                histories={this.state.employee.histories}
                inManager={true}
                onClose={this._handleProfileBoxClose}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
Manager.propTypes = {};
Manager.defaultProps = {};

function getInNOutInfo(data) {
  let beforeIn = 0;
  let afterIn = 0;
  let tardy = 0;
  let early = 0;
  let out = 0;
  let lack = 0;
  let tardyearly = 0;
  for (let employee of data) {
    switch (getCurrentStatus(employee.employee_info, employee.histories)) {
    case 0:
      beforeIn++;
      break;
    case 1:
      afterIn++;
      break;
    case 2:
      tardy++;
      break;
    case 3:
      early++;
      break;
    case 4:
      lack++;
      break;
    case 5:
      tardyearly++;
      break;
    default:
      out++;
    }
  }
  return { beforeIn, afterIn, tardy, early, out, lack, tardyearly };
}

function Thumbnail(props) {
  let statusCode = getCurrentStatus(
    props.info.employee_info,
    props.info.histories
  );
  let status = statusCodeToMsg(statusCode);
  let color = statusCodeToColor(statusCode);
  return (
    <div className="thumbnail-wrapper">
      <div className="thumbnail">
        <a onClick={props.onClick}>
          <img
            id={props.index}
            src={`/profile/${props.info.username}`}
            alt="thumbnail"
          />
        </a>
      </div>
      <div className="username center" title={props.info.username}>
        {props.info.username}
      </div>
      <div className="status center">
        <span className={color}>{status}</span>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  employees: state.manage.employees,
  updateType: state.manage.edit.updateType
});

const mapDispatchToProps = dispatch => ({
  employeesRequest: () => dispatch(employeesRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Manager);
