import { createAction, handleActions } from 'redux-actions';
import update from 'react-addons-update';
import axios from 'axios';

const EMPLOYEES = 'manage/EMPLOYEES';
const EMPLOYEES_SUCCESS = 'manage/EMPLOYEES_SUCCESS';
const EMPLOYEES_FAILURE = 'manage/EMPLOYEES_FAILURE';

const EMPLOYEE_EDIT = 'manage/EMPLOYEE_EDIT';
const EMPLOYEE_EDIT_SUCCESS = 'manage/EMPLOYEE_EDIT_SUCCESS';
const EMPLOYEE_EDIT_FAILURE = 'manage/EMPLOYEE_EDIT_FAILURE';

const initialState = {
  employees: {
    status: 'INIT',
    data: [],
    error: {
      msg: ''
    }
  },
  edit: {
    status: 'INIT',
    updateType: true,
    error: {
      property: '',
      msg: ''
    }
  }
};

export const employeesRequest = function() {
  return dispatch => {
    dispatch(employees());

    return axios
      .get('/api/manage/employee')
      .then(res => {
        dispatch(employeesSuccess(res.data.employees));
      })
      .catch(error => {
        dispatch(employeesFailure(error.response.data.msg));
      });
  };
};

export const employees = createAction(EMPLOYEES);
export const employeesSuccess = createAction(EMPLOYEES_SUCCESS); //payload -> data(array)
export const employeesFailure = createAction(EMPLOYEES_FAILURE); //payload -> msg

export const employeeEditRequest = function(employee, index) {
  return dispatch => {
    dispatch(employeeEdit());
    return axios
      .put('/api/manage/employee', employee)
      .then(res => {
        dispatch(
          employeeEditSuccess({
            employee,
            index,
            updateType: res.data.updateType
          })
        );
      })
      .catch(error => {
        dispatch(
          employeeEditFailure({
            msg: error.response.data.msg,
            property: error.response.data.property || ''
          })
        );
      });
  };
};

export const employeeEdit = createAction(EMPLOYEE_EDIT);
export const employeeEditSuccess = createAction(EMPLOYEE_EDIT_SUCCESS); //{employee, index, type}
export const employeeEditFailure = createAction(EMPLOYEE_EDIT_FAILURE); //{property, msg}

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
      }),
    [EMPLOYEE_EDIT]: (state, action) =>
      update(state, {
        edit: {
          status: { $set: 'WAITING' }
        }
      }),
    [EMPLOYEE_EDIT_SUCCESS]: (state, action) =>
      update(state, {
        edit: {
          status: { $set: 'SUCCESS' },
          updateType: { $set: action.payload.updateType }
        },
        employees: {
          data: action.payload.updateType
            ? {
              [action.payload.index]: { $set: action.payload.employee }
            }
            : { $splice: [[action.payload.index, 1]] }
        }
      }),
    [EMPLOYEE_EDIT_FAILURE]: (state, action) =>
      update(state, {
        edit: {
          status: { $set: 'FAILURE' },
          error: {
            property: { $set: action.payload.property },
            msg: { $set: action.payload.msg }
          }
        }
      })
  },
  initialState
);
