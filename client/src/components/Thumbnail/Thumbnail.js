import React from 'react';
import './Thumbnail.scss';
import {
  getCurrentStatus,
  statusCodeToMsg,
  statusCodeToColor
} from 'utils/history';

function Thumbnail(props) {
  let statusCode = -1;
  if (typeof props.info.employee_info !== 'undefined') {
    statusCode = getCurrentStatus(
      props.info.employee_info,
      props.info.histories
    );
  }

  return (
    <div className="thumbnail-wrapper">
      <div className="thumbnail">
        <a onClick={props.onClick}>
          <img
            id={props.index}
            src={`/profile/${props.info.username}`}
            alt="thumbnail"
          />
        </a>
      </div>
      <div
        className={`username center ${
          typeof props.status === 'undefined'
            ? ''
            : props.status
              ? 'enter'
              : 'leave'
        }`}
        title={props.info.username}
      >
        {props.info.username}
      </div>
      {props.info.employee_info && (
        <div className="status center">
          <span className={statusCodeToColor(statusCode)}>
            {statusCodeToMsg(statusCode)}
          </span>
        </div>
      )}
    </div>
  );
}

export default Thumbnail;
