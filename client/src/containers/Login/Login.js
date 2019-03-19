import React, { Component } from 'react';
import styles from './Login.scss';
import classNames from 'classnames/bind';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loginRequest } from 'modules/auth';
import M from 'materialize-css';
const cx = classNames.bind(styles);

class Login extends Component {
  state = {
    username: '',
    password: ''
  };
  _handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };
  _handleLogin = () => {
    const { username, password } = this.state;
    this.props.loginRequest(username, password).then(() => {
      if (this.props.login.status === 'FAILURE') {
        M.toast({
          html: this.props.login.error.msg,
          displayLength: 2000,
          classes: 'error'
        });
        if (!this.props.login.error.property) return;
        document
          .querySelector(`[name=${this.props.login.error.property}]`)
          .classList.add('invalid');
        document
          .querySelector(`[name=${this.props.login.error.property}]`)
          .classList.remove('valid');
      } else {
        document.cookie = 'key=' + btoa(JSON.stringify(true));
        M.toast({
          html: `Welcom, ${username}!`,
          displayLength: 1000,
          classes: 'success'
        });
        this.props.history.push('/');
      }
    });
  };
  render() {
    const inputBox = (
      <div>
        <div className="input-field col s12 username">
          <label>아이디</label>
          <input
            name="username"
            type="text"
            className="validate"
            onChange={this._handleChange}
          />
        </div>
        <div className="input-field col s12">
          <label>비밀번호</label>
          <input
            name="password"
            type="password"
            className="validate"
            onChange={this._handleChange}
            autoComplete={'new-password'}
          />
        </div>
      </div>
    );

    const loginView = (
      <div>
        <div className="card-content">
          <div className="row">
            {inputBox}
            <a
              className="waves-effect waves-light btn"
              onClick={this._handleLogin}
            >
              로그인
            </a>
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
    return (
      <div className={cx('container', 'auth')}>
        <span className="logo">IN & OUT</span>
        <div className={cx('card')}>
          <div className="header teal lighten-1 white-text center">
            <div className="card-content title">Login</div>
            {loginView}
          </div>
        </div>
      </div>
    );
  }
}
Login.propTypes = {
  byHome: PropTypes.bool
};

Login.defaultProps = {
  byHome: true
};

const mapStateToProps = state => ({
  login: state.auth.login
});

const mapDispatchToProps = dispatch => ({
  loginRequest: (username, password) =>
    dispatch(loginRequest(username, password)),
  logoutRequest: () => dispatch()
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
