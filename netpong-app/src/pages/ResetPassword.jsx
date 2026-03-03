import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginHeader from '../components/LoginHeader';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        document.title = "Reset Password - NetPong";
        const link = document.querySelector("link[rel~='icon']");
        if (link) link.href = "/login.svg";

        return () => {
            document.title = "NetPong";
            if (link) link.href = "/netpong.svg";
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) return setError('Invalid reset link.');
        if (!password) return setError('Password is required.');
        if (password.length < 8) return setError('Password must be at least 8 characters.');
        if (password !== confirmPassword) return setError('Passwords do not match.');

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });

            if (!res.ok) {
                let message = 'Failed to reset password.';
                try {
                    const data = await res.json();
                    if (data?.message) message = data.message;
                } catch { }
                setError(message);
                return;
            }

            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <LoginHeader />

            <div className="antialiased w-full min-h-screen overflow-x-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900" />
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(139,92,246,.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,.3) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px'
                    }}
                />

                <div className="relative z-10">
                    <div className="container mx-auto px-4 py-8 md:py-16 max-w-md">
                        <div className="group">
                            <div className="relative bg-slate-900/60 backdrop-blur-2xl rounded-3xl px-8 py-10 shadow-2xl border border-violet-500/30 hover:border-violet-400/50 transition-all duration-500">

                                <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
                                    Reset Your Password
                                </h1>
                                <p className="text-zinc-400 text-center mb-8 text-sm">
                                    Create a strong new password for your account
                                </p>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 animate-shake">
                                        <p className="text-red-200 text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 mb-6 animate-fade-in">
                                        <p className="text-green-300 font-semibold text-sm">
                                            ✅ Password reset successfully! Redirecting...
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">

                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-zinc-300 mb-2 ml-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isLoading}
                                                placeholder="Enter new password"
                                                className="w-full bg-slate-800/50 text-white px-4 pr-12 py-3.5 rounded-xl border border-slate-700 focus:border-violet-500 transition"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(prev => !prev)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                <svg
                                                    className="w-5 h-5 text-violet-400 hover:text-violet-300 transition"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                >
                                                    {showPassword ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M3 3l18 18M10.58 10.58a2.25 2.25 0 0 0 3.182 3.182" />
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-zinc-300 mb-2 ml-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                disabled={isLoading}
                                                placeholder="Confirm new password"
                                                className="w-full bg-slate-800/50 text-white px-4 pr-12 py-3.5 rounded-xl border border-slate-700 focus:border-violet-500 transition"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                <svg
                                                    className="w-5 h-5 text-violet-400 hover:text-violet-300 transition"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                >
                                                    {showConfirmPassword ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                            d="M3 3l18 18M10.58 10.58a2.25 2.25 0 0 0 3.182 3.182" />
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white py-3.5 font-bold rounded-xl shadow-xl transition hover:scale-[1.02]"
                                    >
                                        {isLoading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                                    <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold text-sm">
                                        Back to Login
                                    </Link>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <style jsx>{`
          @keyframes shake {
            0%,100%{transform:translateX(0)}
            25%{transform:translateX(-5px)}
            75%{transform:translateX(5px)}
          }
          @keyframes fade-in {
            from{opacity:0;transform:translateY(10px)}
            to{opacity:1;transform:translateY(0)}
          }
          .animate-shake{animation:shake .5s ease-in-out}
          .animate-fade-in{animation:fade-in .5s ease-out}
        `}</style>
            </div>
        </div>
    );
}
