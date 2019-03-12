import React, { Component } from 'react';
import styles from './Login.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
const cx = classNames.bind(styles);

class Login extends Component {
  render() {
    const { byHome } = this.props;
    return (
      <div
        className={cx('container', 'auth', {
          'is-not-auth': byHome
        })}
      >
        {!byHome ? (
          <Link className="logo" to="/">
            IN & OUT
          </Link>
        ) : (
          undefined
        )}
        <div className={cx('card')}>
          <div className="header teal lighten-1 white-text center">
            <div className="card-content title">Login</div>
            <LoginView />
          </div>
        </div>
      </div>
    );
  }
}
Login.propTypes = {
  isAuthPage: PropTypes.bool
};

Login.defaultProps = {
  isAuthPage: true
};

function LoginView() {
  return (
    <div>
      <div className="card-content">
        <div className="row">
          <InputBox />
          <a className="waves-effect waves-light btn">로그인</a>
        </div>
      </div>
      <div className="footer">
        <div className="card-content">
          <div className="center">
            처음이세요?
            <span className="create">
              <Link to="/register">회원가입</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputBox() {
  return (
    <div>
      <div className="input-field col s12 username">
        <label>아이디</label>
        <input name="username" type="text" className="validate" />
      </div>
      <div className="input-field col s12">
        <label>비밀번호</label>
        <input
          name="password"
          type="password"
          className="validate"
          autoComplete={'new-password'}
        />
      </div>
    </div>
  );
}

export default Login;
