import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header, NotFound } from 'components';
import { Manager, Employee, Login, Register, Chat } from 'containers';
import { connect } from 'react-redux';
import { logoutRequest, infoRequest } from 'modules/auth';
import M from 'materialize-css';
import 'materialize-css/dist/css/materialize.min.css';
import Loader from 'react-loader-spinner';

class App extends Component {
  _handleLogout = () => {
    this.props.logoutRequest().then(() => {
      M.toast({
        html: 'See you again~!',
        displayTime: 1000,
        calsses: 'success'
      });
      document.cookie = 'key=' + btoa(JSON.stringify(false));
      this.props.history.push('/');
    });
  };

  _getCookie = name => {
    var value = '; ' + document.cookie;
    var parts = value.split('; ' + name + '=');
    if (parts.length === 2) {
      return parts
        .pop()
        .split(';')
        .shift();
    }
  };
  _checkSession = () => {
    //세션이 만료되었다는 것을 알려주기 위한 작업

    //GET COOKIE BY NAME
    let isLoggedIn = this._getCookie('key');

    //처음 사이트 접속 또는 쿠키 삭제시 -> 로그인페이지로 이동
    if (typeof isLoggedIn === 'undefined') {
      return;
    }

    isLoggedIn = JSON.parse(atob(isLoggedIn));
    //이전에 로그아웃 하고 사이트를 나갔을 경우 -> 로그인페이지로 이동
    if (!isLoggedIn) {
      //회원가입 페이지로 처음 들어오려고 했던경우
      if (this.props.location.pathname === '/register') {
        this.props.history.push('/register');
        return;
      }
      return;
    }

    //로그인 되어있다고 쿠키가 말해줄 경우(로그인하고 브라우저를 끄거나 다른사이트로 이동)
    //세션이 아직 유효한지 확인
    this.props.infoRequest().then(() => {
      if (!this.props.info.isLoggedIn) {
        //세션 만료
        document.cookie = `key=${btoa(JSON.stringify(false))}`;
        M.toast({
          html: '세션이 만료되었습니다. 다시 로그인해 주세요.',
          displayTime: 1000,
          calsses: 'error'
        });
        this.props.history.push('/');
      }
    });
  };
  componentDidMount() {
    this._checkSession();
  }

  render() {
    const { info } = this.props;
    const isAuthPage = /(\/register)|(\/login)/.test(
      this.props.location.pathname
    );
    if (info.status === 'WAITING') {
      return (
        <div className="loading-spinner">
          <Loader type="Oval" color="#26a69a" height="50" width="50" />
        </div>
      );
    }
    if (info.status === 'INIT' || info.status === 'FAILURE') {
      return (
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </Switch>
      );
    }
    return (
      <div>
        {!isAuthPage && <Header onLogout={this._handleLogout} />}
        <Switch>
          <Route exact path="/" component={info.type ? Manager : Employee} />
          <Route
            exact
            path="/chat"
            component={props => {
              if (info.status === 'INIT' || info.status === 'WAITING') {
                return (
                  <div className="loading-spinner">
                    <Loader
                      type="Oval"
                      color="#26a69a"
                      height="50"
                      width="50"
                    />
                  </div>
                );
              }
              return <Chat {...props} />;
            }}
          />
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  info: state.auth.info
});

const mapDispatchToProps = dispatch => ({
  logoutRequest: () => dispatch(logoutRequest()),
  infoRequest: () => dispatch(infoRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
