import { createAction, handleActions } from 'redux-actions';
import update from 'react-addons-update';
import axios from 'axios';

const EMPLOYEES = 'manage/EMPLOYEES';
const EMPLOYEES_SUCCESS = 'manage/EMPLOYEES_SUCCESS';
const EMPLOYEES_FAILURE = 'manage/EMPLOYEES_FAILURE';

const initialState = {
  employees: {
    status: 'INIT',
    data: [],
    error: {
      msg: ''
    }
  }
};

export const employeesRequest = function() {
  return dispatch => {
    dispatch(employees());

    return axios
      .get('/api/manage')
      .then(res => {
        dispatch(employeesSuccess(res.data.employees));
      })
      .catch(error => {
        console.log(error);
        dispatch(employeesFailure(error.response.data.msg));
      });
  };
};

export const employees = createAction(EMPLOYEES);
export const employeesSuccess = createAction(EMPLOYEES_SUCCESS); //payload -> data(array)
export const employeesFailure = createAction(EMPLOYEES_FAILURE); //payload -> msg

export default handleActions(
  {
    [EMPLOYEES]: (state, action) =>
      update(state, {
        employees: {
          status: { $set: 'WAITING' }
        }
      }),
    [EMPLOYEES_SUCCESS]: (state, action) =>
      update(state, {
        employees: {
          status: { $set: 'SUCCESS' },
          data: { $set: action.payload }
        }
      }),
    [EMPLOYEES_FAILURE]: (state, action) =>
      update(state, {
        employees: {
          status: { $set: 'FAILURE' },
          error: {
            msg: { $set: action.payload }
          }
        }
      })
  },
  initialState
);
