import React, { Component } from 'react';
import classNames from 'classnames/bind';
import styles from './Register.scss';
import { Link } from 'react-router-dom';
import M from 'materialize-css';
import { connect } from 'react-redux';
import { registerRequest } from 'modules/auth';
import axios from 'axios';
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
      duty: 0
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
          e.target.name === 'duty' ? Number(e.target.value) : e.target.value
      }
    }));
  }
  _handleRegister() {
    this.props.registerRequest(this.state).then(() => {
      if (this.props.register.status === 'FAILURE') {
        document
          .querySelector(`[name=${this.props.register.error.property}]`)
          .classList.add('invalid');
        document
          .querySelector(`[name=${this.props.register.error.property}]`)
          .classList.remove('valid');
        M.toast({
          html: this.props.register.error.msg,
          displayLength: 2000,
          classes: 'error'
        });
      } else {
        //axios file upload
        let formData = new FormData();
        formData.append('username', this.state.username);
        formData.append(
          'profile_img',
          document.querySelector('[name="profile_img"]').files[0]
        );
        axios
          .post('/api/account/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          .then(res => {
            M.toast({
              html: 'Success~!',
              displayLength: 1000,
              classes: 'success'
            });
            this.props.history.push('/login');
          })
          .catch(error => {
            M.toast({
              html: '사진업로드 실패',
              displayLength: 1000,
              classes: 'error'
            });
          });
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
  _handleProfileClick = () => {
    let profile_input = document.querySelector('[name="profile_img"]');
    profile_input.click();
  };
  _handleProfileSelect = e => {
    if (e.target.files.length === 0) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('profile_img').src = e.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
  };
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
        <span className="logo">IN & OUT</span>
        <div className="card">
          <div className="back">
            <Link to="/login">
              <i className="material-icons back">keyboard_backspace</i>
            </Link>
          </div>
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
              onProfileClick={this._handleProfileClick}
              onProfileSelect={this._handleProfileSelect}
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
  out_time,
  onProfileClick,
  onProfileSelect
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
            onProfileClick={onProfileClick}
            onProfileSelect={onProfileSelect}
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
  out_time,
  onProfileClick,
  onProfileSelect
}) {
  return (
    <div>
      <div className="upload-box">
        <div className="thumbnail-wrapper">
          <div className="thumbnail">
            <div className="centered">
              <a onClick={onProfileClick}>
                <img
                  id="profile_img"
                  src="/profile/default.png"
                  alt="default"
                />
              </a>
            </div>
          </div>
        </div>

        <input
          type="file"
          name="profile_img"
          onChange={onProfileSelect}
          accept="image/*"
        />
      </div>
      <div className="input-field col s12 username">
        <label htmlFor="input_id">아이디</label>
        <input
          id="input_id"
          name="username"
          type="text"
          className="validate"
          onChange={onChange}
        />
      </div>
      <div className="input-field col s12">
        <label htmlFor="input_password">비밀번호</label>
        <input
          id="input_password"
          name="password"
          type="password"
          className="validate"
          onChange={onChange}
          autoComplete={'new-password'}
        />
      </div>
      <div className="input-field col s12">
        <label htmlFor="input_password_check">비밀번호 재입력</label>
        <input
          id="input_password_check"
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
          <label htmlFor="input_ip">
            아이피 주소 :{' '}
            <small>직원 로그인시 체크할 주소, 미입력시 체크안함</small>
          </label>
          <input
            id="input_ip"
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
        <label className="active" htmlFor="input_in">
          출근시간
        </label>
        <input
          id="input_in"
          name="in"
          type="text"
          className="timepicker"
          value={in_time}
          onChange={() => {}}
        />
      </div>
      <div className="input-field col s6">
        <label className="active" htmlFor="input_out">
          퇴근시간
        </label>
        <input
          id="input_out"
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
      <label htmlFor="input_duty">
        근무시간 <small>단위 : 분</small>
      </label>
      <input
        id="input_duty"
        name="duty"
        type="number"
        max="1200"
        min="10"
        className="validate"
        onChange={onChange}
      />
    </div>
  );
  return (
    <div>
      <div className="input-field manager col s12">
        <label htmlFor="input_manager">관리자 아이디</label>
        <input
          id="input_manager"
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
