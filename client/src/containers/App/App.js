import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { Route } from 'react-router-dom';
import { Header } from 'components';
import { Home, Login, Register } from 'containers';

class App extends Component {
  render() {
    //TEMPORARY CODE
    const isAuthPage = /(login|register)/.test(this.props.location.pathname);
    return (
      <div>
        {!isAuthPage ? <Header /> : undefined}
        <Route
          exact
          path="/"
          component={() => <Home isLoggedIn={false} idAuthPage={isAuthPage} />}
        />
        <Route exact path="/login" component={Login} isAuthPage={true} />
        <Route exact path="/register" component={Register} />
      </div>
    );
  }
}

export default hot(module)(App);
