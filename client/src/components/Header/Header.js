import React, { Component } from 'react';
import classNames from 'classnames/bind';
import styles from './Header.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

class Header extends Component {
  render() {
    return (
      <div className="navigation">
        <nav>
          <div className={cx('nav', 'nav-wrapper', 'teal', 'lighten-1')}>
            <Link to="/" className={cx('brand-logo', 'left')}>
              IN & OUT
            </Link>
            <div className={cx('right')}>
              <ul>
                <li>
                  <a>
                    <i
                      className={cx('material-icons', 'search-icon')}
                      onClick={this.toggleSearch}
                    >
                      search
                    </i>
                  </a>
                </li>
                <li>
                  <Link to="/chat">
                    <i
                      className={cx('material-icons', 'search-icon')}
                      onClick={this.toggleSearch}
                    >
                      chat
                    </i>
                  </Link>
                </li>
                {this.props.isLoggedIn ? <LogoutButton /> : <LoginButton />}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

function LoginButton() {
  return (
    <li>
      <Link to="/login">
        <i className={cx('material-icons')}>vpn_key</i>
      </Link>
    </li>
  );
}

function LogoutButton() {
  return (
    <li>
      <a onClick={this.props.onSignOut}>
        <i className={cx('material-icons')}>lock_open</i>
      </a>
    </li>
  );
}

export default Header;
