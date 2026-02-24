import { Navigate } from 'react-router-dom';
import { getToken } from './authToken';
import { refreshAccessToken } from './api';

export default function PrivateRoute({ children }) {
    refreshAccessToken();
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
