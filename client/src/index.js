import React from 'react';
import ReactDOM from 'react-dom';
import { App } from 'containers';
import { BrowserRouter, Route } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import 'styles/base.scss';

//Redux
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reducers from 'modules';
import thunk from 'redux-thunk';

const devTools =
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
const store = compose(
  applyMiddleware(thunk),
  devTools
)(createStore)(reducers);

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./modules', () => {
    const newRootReducer = require('./modules/index').default;
    store.replaceReducer(newRootReducer);
  });
}

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Route component={App} />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();

if (module.hot) {
  module.hot.accept();
}
