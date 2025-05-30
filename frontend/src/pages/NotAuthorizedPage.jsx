import { Link } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';// Added useContext
const NotAuthorizedPage = () => (
  <div>
    <h2>Not Authorized</h2>
    <p>You do not have permission to view this page.</p>
    <Link to="/">Go to Homepage</Link>
  </div>
);
export default NotAuthorizedPage;
