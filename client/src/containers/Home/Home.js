import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Login } from 'containers';

class Home extends Component {
  render() {
    const { isLoggedIn } = this.props;
    if (!isLoggedIn) {
      return <Login byHome={true} />;
    }
    return <div>Home</div>;
  }
}

Home.propTypes = {
  isLoggedIn: PropTypes.bool
};

Home.defaultProps = {
  isLoggedIn: false
};

export default Home;
