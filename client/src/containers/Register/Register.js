import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './Register.scss';
import { Link } from 'react-router-dom';
import M from 'materialize-css';
import { connect } from 'react-redux';
import { registerRequest } from 'modules/auth';
const cx = classNames.bind(styles);

class Register extends Component {
  constructor(props) {
    super(props);
    this._handleTypeChange = this._handleTypeChange.bind(this);
    this._handleIsFreeChange = this._handleIsFreeChange.bind(this);
    this._handleChange = this._handleChange.bind(this);
    this._handleRegister = this._handleRegister.bind(this);
    this._handleTimePicker = this._handleTimePicker.bind(this);
  }
  state = {
    username: '',
    password: '',
    password_check: '',
    type: true,
    employee_info: {
      is_free: false,
      manager: '',
      in: '09:00',
      out: '18:00',
      time: 0
    },
    ip: ''
  };
  _handleTypeChange(e) {
    this.setState({
      type: e.target.value === 'true' ? true : false
    });
  }
  _handleIsFreeChange(e) {
    e.persist();
    this.setState(state => ({
      employee_info: {
        ...state.employee_info,
        is_free: e.target.value === 'true' ? true : false
      }
    }));
  }
  _handleChange(e) {
    e.persist();
    if (
      e.target.name === 'username' ||
      e.target.name === 'password' ||
      e.target.name === 'password_check' ||
      e.target.name === 'ip'
    ) {
      this.setState({
        [e.target.name]: e.target.value
      });
      return;
    }

    this.setState(state => ({
      employee_info: {
        ...state.employee_info,
        [e.target.name]:
          e.target.name === 'time' ? Number(e.target.value) : e.target.value
      }
    }));
  }
  _handleRegister() {
    this.props.registerRequest(this.state).then(() => {
      if (this.props.register.status === 'FAILURE') {
        console.log(this.props.register);
        document
          .querySelector(`[name=${this.props.register.error.property}]`)
          .classList.add('invalid');
        document
          .querySelector(`[name=${this.props.register.error.property}]`)
          .classList.remove('valid');
        M.toast({ html: this.props.register.error.msg });
      } else {
        M.toast({ html: 'success~!' });
        this.props.history.push('/login');
      }
    });
  }
  _handleTimePicker(hour, minute, type) {
    this.setState(state => ({
      employee_info: {
        ...state.employee_info,
        [type]: `${hour < 10 ? '0' + hour : hour}:${
          minute < 10 ? '0' + minute : minute
        }`
      }
    }));
  }
  componentDidUpdate() {
    const in_element = document.querySelector('[name=in]');
    const in_instance = M.Timepicker.init(in_element, {
      twelveHour: false,
      autoClose: true,
      defaultTime: '09:00',
      onCloseEnd: () => {
        this._handleTimePicker(in_instance.hours, in_instance.minutes, 'in');
      }
    });

    const out_element = document.querySelector('[name=out]');
    const out_instance = M.Timepicker.init(out_element, {
      twelveHour: false,
      autoClose: true,
      defaultTime: '18:00',
      onCloseEnd: () => {
        this._handleTimePicker(out_instance.hours, out_instance.minutes, 'out');
      }
    });
  }

  render() {
    return (
      <div className={cx('container', 'auth')}>
        <Link className={cx('logo')} to="/">
          IN & OUT
        </Link>
        <div className="card">
          <div className="header teal lighten-1 white-text center">
            <div className="card-content title">Register</div>
            <RegisterView
              type={this.state.type}
              is_free={this.state.employee_info.is_free}
              onTypeChange={this._handleTypeChange}
              onIsFreeChange={this._handleIsFreeChange}
              onChange={this._handleChange}
              onSubmit={this._handleRegister}
              in_time={this.state.employee_info.in}
              out_time={this.state.employee_info.out}
            />
          </div>
        </div>
      </div>
    );
  }
}

function RegisterView({
  type,
  is_free,
  onTypeChange,
  onIsFreeChange,
  onChange,
  onSubmit,
  in_time,
  out_time
}) {
  return (
    <div>
      <div className="card-content">
        <div className="row">
          <InputBox
            type={type}
            is_free={is_free}
            onTypeChange={onTypeChange}
            onIsFreeChange={onIsFreeChange}
            onChange={onChange}
            in_time={in_time}
            out_time={out_time}
          />
          <a className="waves-effect waves-light btn" onClick={onSubmit}>
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}

function InputBox({
  type,
  is_free,
  onTypeChange,
  onIsFreeChange,
  onChange,
  in_time,
  out_time
}) {
  return (
    <div>
      <div className="input-field col s12 username">
        <label>아이디</label>
        <input
          name="username"
          type="text"
          className="validate"
          onChange={onChange}
        />
      </div>
      <div className="input-field col s12">
        <label>비밀번호</label>
        <input
          name="password"
          type="password"
          className="validate"
          onChange={onChange}
          autoComplete={'new-password'}
        />
      </div>
      <div className="input-field col s12">
        <label>비밀번호 재입력</label>
        <input
          name="password_check"
          type="password"
          className="validate"
          onChange={onChange}
        />
      </div>
      <div className="radio-field col s12 left-align">
        <label className="title">회원종류</label>
        <label>
          <input
            type="radio"
            className="with-gap"
            name="type"
            value="true"
            onChange={onTypeChange}
            checked={type}
          />
          <span>관리자</span>
        </label>
        <label>
          <input
            type="radio"
            className="with-gap"
            name="type"
            value="false"
            onChange={onTypeChange}
            checked={!type}
          />
          <span>직원</span>
        </label>
      </div>
      {!type ? (
        <EmployeeBox
          is_free={is_free}
          onIsFreeChange={onIsFreeChange}
          onChange={onChange}
          in_time={in_time}
          out_time={out_time}
        />
      ) : (
        <div className="input-field col s12 ip">
          <label>
            아이피 주소 : <small>직원 로그인시 체크할 주소</small>
          </label>
          <input
            name="ip"
            type="text"
            className="validate"
            onChange={onChange}
          />
        </div>
      )}
    </div>
  );
}

function EmployeeBox({ is_free, onIsFreeChange, onChange, in_time, out_time }) {
  const nonFreeBox = (
    <div className="left-align">
      <div className="input-field col s6">
        <label className="active">출근시간</label>
        <input
          name="in"
          type="text"
          className="timepicker"
          value={in_time}
          onChange={() => {}}
        />
      </div>
      <div className="input-field col s6">
        <label className="active">퇴근시간</label>
        <input
          name="out"
          type="text"
          className="timepicker"
          value={out_time}
          onChange={() => {}}
        />
      </div>
    </div>
  );

  const freeBox = (
    <div className="input-field col s12">
      <label>
        근무시간 <small>단위 : 분</small>
      </label>
      <input
        name="time"
        type="number"
        max="20"
        min="1"
        className="validate"
        onChange={onChange}
      />
    </div>
  );
  return (
    <div>
      <div className="input-field manager col s12">
        <label>관리자 아이디</label>
        <input
          name="manager"
          type="text"
          className="validate"
          onChange={onChange}
        />
      </div>
      <div className="radio-field col s12 left-align">
        <label className="title">자율출퇴근제</label>
        <label>
          <input
            type="radio"
            className="with-gap"
            name="is_free"
            value="true"
            onChange={onIsFreeChange}
            checked={is_free}
          />
          <span>YES</span>
        </label>
        <label>
          <input
            type="radio"
            className="with-gap"
            name="is_free"
            value="false"
            checked={!is_free}
            onChange={onIsFreeChange}
          />
          <span>NO</span>
        </label>
      </div>
      {is_free ? freeBox : nonFreeBox}
    </div>
  );
}

Register.propTypes = {};
Register.defaultProps = {};

const mapStateToProps = state => {
  return { register: state.auth.register };
};

const mapDispatchToProps = dispatch => {
  return {
    registerRequest: account => {
      return dispatch(registerRequest(account));
    }
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);
