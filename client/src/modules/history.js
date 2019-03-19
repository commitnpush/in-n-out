import { createAction, handleActions } from 'redux-actions';
import update from 'react-addons-update';
import axios from 'axios';

const HISTORY = 'history/HISTORY';
const HISTORY_FAILURE = 'history/HISTORY_FAILURE';

const IN = 'history/IN';
const IN_FAILURE = 'history/IN_FAILURE';

const OUT = 'history/OUT';
const OUT_FAILURE = 'history/OUT_FAILURE';

const initialState = {
  history: {
    status: 'INIT',
    data: [],
    error: {
      msg: ''
    }
  },
  in: {
    status: 'INIT',
    error: {
      msg: ''
    }
  },
  out: {
    status: 'INIT',
    error: {
      msg: ''
    }
  }
};

//HISTORY
export const historyRequest = function() {
  return dispatch => {
    return axios
      .get('/api/history')
      .then(response => {
        dispatch(history(response.data));
      })
      .catch(error => {
        dispatch(historyFailure(error.response.data.msg));
      });
  };
};
export const history = createAction(HISTORY); //histories
export const historyFailure = createAction(HISTORY_FAILURE); //msg

//IN - 출근
export const inRequest = function() {
  return dispatch => {
    return axios
      .put('/api/history/in')
      .then(response => {
        dispatch(inAction(response.data.in));
      })
      .catch(error => {
        dispatch(inFailure(error.response.data.msg));
      });
  };
};
export const inAction = createAction(IN); //in
export const inFailure = createAction(IN_FAILURE); //msg

//OUT - 퇴근
export const outRequest = function() {
  return dispatch => {
    return axios
      .put('/api/history/out')
      .then(response => {
        dispatch(out(response.data.out));
      })
      .catch(error => {
        dispatch(outFailure(error.response.data.msg));
      });
  };
};
export const out = createAction(OUT); //out
export const outFailure = createAction(OUT_FAILURE); //msg

export default handleActions(
  {
    [HISTORY]: (state, action) => {
      return update(state, {
        history: {
          status: { $set: 'SUCCESS' },
          data: { $set: action.payload }
        }
      });
    },
    [HISTORY_FAILURE]: (state, action) => {
      return update(state, {
        history: {
          status: { $set: 'FAILURE' },
          error: {
            msg: { $set: action.payload }
          }
        }
      });
    },
    [IN]: (state, action) => {
      return update(state, {
        in: {
          status: { $set: 'SUCCESS' }
        },
        history: {
          data: {
            0: { in: { $set: action.payload } }
          }
        }
      });
    },
    [IN_FAILURE]: (state, action) => {
      return update(state, {
        in: {
          status: { $set: 'FAILURE' },
          error: {
            msg: { $set: action.payload }
          }
        }
      });
    },
    [OUT]: (state, action) => {
      return update(state, {
        out: {
          status: { $set: 'SUCCESS' }
        },
        history: {
          data: {
            0: { out: { $set: action.payload } }
          }
        }
      });
    },
    [OUT_FAILURE]: (state, action) => {
      return update(state, {
        out: {
          status: { $set: 'FAILURE' },
          error: {
            msg: { $set: action.payload }
          }
        }
      });
    }
  },
  initialState
);
