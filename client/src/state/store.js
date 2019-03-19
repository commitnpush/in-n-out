import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducer from 'modules';

const reduxDevTools =
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const configureStore = () => {
  const store = createStore(
    reducer,
    compose(
      applyMiddleware(thunk),
      reduxDevTools
    )
  );

  if (process.env.NODE_ENV !== 'production') {
    if (module.hot) {
      module.hot.accept('../modules/index', () => {
        store.replaceReducer(reducer);
      });
    }
  }

  return store;
};

export default configureStore;
