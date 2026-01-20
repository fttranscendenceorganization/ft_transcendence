import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshAccessToken } from '../utils/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      const ok = await refreshAccessToken();
      if (ok) {
        navigate('/user', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-400">Completing sign in...</p>
      </div>
    </div>
  );
}
