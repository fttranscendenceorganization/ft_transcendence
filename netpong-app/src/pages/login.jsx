import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';
import LoginHeader from '../components/loginHeader';
import { setToken } from '../utils/authToken';

const initiateGoogleAuth = () => {
  window.location.href = '/api/auth/google';
};

const initiateGithubAuth = () => {
  window.location.href = '/api/auth/github';
};

const initiateIntra42Auth = () => {
  window.location.href = '/api/auth/42';
};

const handleSocialLogin = (provider) => {
  if (provider === 'google') {
    initiateGoogleAuth();
  }

  if (provider === 'github') {
    initiateGithubAuth();
  }

  if (provider === '42') {
    initiateIntra42Auth();
  }
};

export default function Login() {

  useEffect(() => {
    document.title = "Login-Netpong";

    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = "/login.svg";
    }

    return () => {
      document.title = "NetPong";
      if (link) {
        link.href = "/netpong.svg";
      }
    };
  }, []);

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
      const message = err.message || 'Login failed. Please check your credentials.';
      if (message.includes('password')) {
        setError('This account uses Google Sign-In. Click "Sign in with Google" below.');
      } else {
        setError(message);
      }
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

          <div className="mt-8 pt-8 border-t border-violet-500/30">
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
              <span className="text-gray-400 text-sm font-bold">OR SIGN IN WITH</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 py-3 px-4 font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border-2 border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="hidden sm:inline">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border-2 border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('42')}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 px-4 font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 border-2 border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.42L13.58 24v-6.42H8.42L0 8.42V2h6.42v6.42H12V2h6.42v10.42H24z" />
                </svg>
                <span className="hidden sm:inline">42</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}