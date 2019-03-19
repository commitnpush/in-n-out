import { combineReducers } from 'redux';
import auth from './auth';
import history from './history';

export default combineReducers({ auth, history });
