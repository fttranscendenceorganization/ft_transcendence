import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LoginHeader from '../components/loginHeader';
import { setToken } from '../utils/authToken';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrusername: identifier,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      setToken(data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="antialiased w-full min-h-screen overflow-x-hidden">
      <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
        <source src="/images/sm.mp4" type="video/mp4" />
      </video>

      <LoginHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl px-6 md:px-10 py-8 md:py-12 shadow-2xl border border-violet-500/30">
          <h1 className="text-lg md:text-xl font-bold text-zinc-100 text-center mb-4">
            START TO PLAY <Link to="/" className="font-extrabold text-violet-400 text-xl md:text-2xl drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]">NETPONG</Link>
          </h1>

          <h2 className="font-bold text-2xl md:text-4xl text-zinc-100 text-center mb-2">
            <span className="relative inline-block">
              SIGN IN
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600 rounded-full"></span>
            </span>
          </h2>

          <h4 className="font-bold text-sm md:text-base text-zinc-100 text-center mb-8">
            Don't have an Account? <Link to="/signup" className="text-violet-400 hover:text-violet-300 transition">Create Account</Link>
          </h4>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <p className="text-red-200 text-sm font-semibold text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="relative mb-6">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
                placeholder=" "
                className="w-full bg-white/10 text-zinc-100 p-2 pl-10 md:pl-12 rounded-xl border-2 border-violet-500/50 backdrop-blur-sm shadow-xl h-14 md:h-16 hover:bg-white/15 hover:border-violet-400 focus:outline-none focus:border-violet-400 focus:bg-white/15 peer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute top-1/2 left-3 md:left-4 -translate-y-1/2 text-zinc-200 pointer-events-none font-bold text-sm md:text-base peer-focus:text-xs peer-focus:top-2 peer-focus:text-violet-300 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-violet-300 transition-all">
                Email or Username
              </span>
              <svg className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>

            <div className="relative mb-8">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder=" "
                className="w-full bg-white/10 text-zinc-100 p-2 pl-10 md:pl-12 rounded-xl border-2 border-violet-500/50 backdrop-blur-sm shadow-xl h-14 md:h-16 hover:bg-white/15 hover:border-violet-400 focus:outline-none focus:border-violet-400 focus:bg-white/15 peer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="absolute top-1/2 left-3 md:left-4 -translate-y-1/2 text-zinc-200 pointer-events-none font-bold text-sm md:text-base peer-focus:text-xs peer-focus:top-2 peer-focus:text-violet-300 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-violet-300 transition-all">
                Password
              </span>
              <svg className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002" />
              </svg>
            </div>

            <div className="text-center">
              <button 
                type="submit" 
                disabled={isLoading}
                className="group relative bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white py-4 px-8 md:px-16 font-bold rounded-xl shadow-2xl shadow-violet-500/50 transition-all duration-300 text-sm md:text-base w-full md:w-auto hover:scale-105 border-2 border-violet-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? 'LOGGING IN...' : 'LOGIN'}
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </button>
            </div>

            <div className="text-center mt-6">
              <a href="#" className="text-sm text-violet-300 hover:text-violet-200 transition">Forgot Password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}