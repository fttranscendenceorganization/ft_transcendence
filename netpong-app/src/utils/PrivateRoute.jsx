import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from './authToken';
import { refreshAccessToken } from './api';

export default function PrivateRoute({ children }) {
  const [status, setStatus] = useState('loading');
  const location = useLocation();

  useEffect(() => {
    if (getToken()) {
      setStatus('ok');
      return;
    }
    refreshAccessToken().then((ok) => setStatus(ok ? 'ok' : 'fail'));
  }, []);

  if (status === 'loading') return <Spinner />;
  if (status === 'fail') return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#fff',
        animation: 'spin 0.65s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}