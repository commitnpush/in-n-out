import React from 'react';
import ReactDOM from 'react-dom';
import App from 'containers/App/App';
import { BrowserRouter, Route } from 'react-router-dom';
import 'styles/base.scss';

//Redux
import { Provider } from 'react-redux';
import configureStore from 'state/store';

const store = configureStore();

const render = Component => {
  return ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <Route component={Component} />
      </BrowserRouter>
    </Provider>,
    document.getElementById('root')
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./containers/App/App', () => {
    const NextApp = require('./containers/App/App').default;
    render(NextApp);
  });
}
