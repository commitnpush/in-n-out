import React from 'react';
import './NotFound.scss';
import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="not-found">
      뭘 찾으시는거죠? <br />
      <Link to="/">메인페이지</Link>
    </div>
  );
}
