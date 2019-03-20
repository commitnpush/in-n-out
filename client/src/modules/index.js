import { combineReducers } from 'redux';
import auth from './auth';
import history from './history';
import manage from './manage';

export default combineReducers({ auth, history, manage });
