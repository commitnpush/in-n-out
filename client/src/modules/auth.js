import { createAction, handleActions } from 'redux-actions';
import update from 'react-addons-update';
import axios from 'axios';

//액션 타입
const REGISTER = 'auth/REGISTER';
const REGISTER_SUCCESS = 'auth/REGISTER_SUCCESS';
const REGISTER_FAILURE = 'auth/REGISTER_FAILURE';

const LOGIN = 'auth/LOGIN';
const LOGIN_SUCCESS = 'auth/LOGIN_SUCCESS';
const LOGIN_FAILURE = 'auth/LOGIN_FAILURE';

const LOGOUT = 'auth/LOGOUT';

const INFO = 'auth/INFO';
const INFO_SUCCESS = 'auth/INFO_SUCCESS';
const INFO_FAILURE = 'auth/INFO_FAILURE';

const initialState = {
  register: {
    status: 'INIT',
    error: {
      msg: '',
      property: ''
    }
  },
  login: {
    status: 'INIT',
    error: {
      msg: '',
      property: ''
    }
  },
  info: {
    status: 'INIT',
    isLoggedIn: false,
    type: false,
    username: ''
  }
};

//REGISTER
export function registerRequest(account) {
  return dispatch => {
    dispatch(register);

    return axios
      .post('/api/account/register', { account })
      .then(response => {
        dispatch(registerSuccess());
      })
      .catch(error => {
        dispatch(
          registerFailure({
            msg: error.response.data.msg,
            property: error.response.data.property
          })
        );
      });
  };
}

export const register = createAction(REGISTER);
export const registerSuccess = createAction(REGISTER_SUCCESS);
export const registerFailure = createAction(REGISTER_FAILURE); //msg, property

//LOGIN
export function loginRequest(username, password) {
  return dispatch => {
    dispatch(login());

    return axios
      .post('/api/account/login', { username, password })
      .then(response => {
        dispatch(loginSuccess({ username, type: response.data.type }));
      })
      .catch(error => {
        dispatch(
          loginFailure({
            msg: error.response ? error.response.data.msg : '서버에러',
            property: error.response ? error.response.data.property : undefined
          })
        );
      });
  };
}

export const login = createAction(LOGIN);
export const loginSuccess = createAction(LOGIN_SUCCESS); //username, type
export const loginFailure = createAction(LOGIN_FAILURE); //msg, property

//LOGOUT
export function logoutRequest() {
  return dispatch => {
    return axios.post('/api/account/logout').then(response => {
      dispatch(logout());
    });
  };
}
export const logout = createAction(LOGOUT);

//INFO
export function infoRequest() {
  return dispatch => {
    dispatch(info());

    return axios
      .get('/api/account/info')
      .then(response => {
        dispatch(
          infoSuccess({
            username: response.data.info.username,
            type: response.data.info.type
          })
        );
      })
      .catch(error => {
        dispatch(infoFailure());
      });
  };
}

export const info = createAction(INFO);
export const infoSuccess = createAction(INFO_SUCCESS); //username, type
export const infoFailure = createAction(INFO_FAILURE);

export default handleActions(
  {
    //REGISTER
    [REGISTER]: (state, action) => {
      return update(state, {
        register: {
          status: { $set: 'WAITING' }
        }
      });
    },
    [REGISTER_SUCCESS]: (state, action) => {
      return update(state, {
        register: {
          status: { $set: 'SUCCESS' }
        }
      });
    },
    [REGISTER_FAILURE]: (state, action) => {
      return update(state, {
        register: {
          status: { $set: 'FAILURE' },
          error: {
            msg: { $set: action.payload.msg },
            property: { $set: action.payload.property }
          }
        }
      });
    },

    //LOGIN
    [LOGIN]: (state, action) => {
      return update(state, {
        login: {
          status: { $set: 'WAITING' }
        }
      });
    },
    [LOGIN_SUCCESS]: (state, action) => {
      return update(state, {
        login: {
          status: { $set: 'SUCCESS' }
        },
        info: {
          isLoggedIn: { $set: true },
          username: { $set: action.payload.username },
          type: { $set: action.payload.type }
        }
      });
    },
    [LOGIN_FAILURE]: (state, action) => {
      return update(state, {
        login: {
          status: { $set: 'FAILURE' },
          error: {
            msg: { $set: action.payload.msg },
            property: { $set: action.payload.property }
          }
        }
      });
    },

    //LOGOUT
    [LOGOUT]: (state, action) => {
      return update(state, {
        info: {
          isLoggedIn: { $set: false },
          username: { $set: '' },
          type: { $set: false }
        }
      });
    },

    //INFO
    [INFO]: (state, action) => {
      return update(state, {
        info: {
          status: { $set: 'WAITING' }
        }
      });
    },
    [INFO_SUCCESS]: (state, action) => {
      return update(state, {
        info: {
          status: { $set: 'SUCCESS' },
          isLoggedIn: { $set: true },
          username: { $set: action.payload.username },
          type: { $set: action.payload.type }
        }
      });
    },
    [INFO_FAILURE]: (state, action) => {
      return update(state, {
        info: {
          status: { $set: 'FAILURE' },
          isLoggedIn: { $set: false },
          username: { $set: '' },
          type: { $set: false }
        }
      });
    }
  },
  initialState
);
