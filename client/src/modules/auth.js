import { createAction, handleActions } from 'redux-actions';
import update from 'react-addons-update';
import axios from 'axios';

//액션 타입
const REGISTER = 'auth/REGISTER';
const REGISTER_SUCCESS = 'auth/REGISTER_SUCCESS';
const REGISTER_FAILURE = 'auth/REGISTER_FAILURE';

const initialState = {
  register: {
    status: 'INIT',
    error: {
      msg: '',
      property: ''
    }
  }
};
export function registerRequest(account) {
  return dispatch => {
    dispatch(register);

    return axios
      .post('/api/account/signup', { account })
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
export const registerFailure = createAction(REGISTER_FAILURE);

export default handleActions(
  {
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
    }
  },
  initialState
);
