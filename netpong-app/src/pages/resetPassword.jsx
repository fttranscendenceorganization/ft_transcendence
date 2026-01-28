import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginHeader from '../components/loginHeader';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        document.title = "Reset Password - NetPong";

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
            return;
        }

        if (!password) {
            setError('Password is required.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword: password,
                }),
            });

            if (!res.ok) {
                let message = 'Failed to reset password. Please try again.';
                try {
                    const data = await res.json();
                    if (data?.message)
                        message = data.message;
                } catch {
                }
                setError(message);
                return;
            }

            setSuccess(true);
            setPassword('');
            setConfirmPassword('');

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('An error occurred. Please try again later.');
            console.error('Reset password error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col">
                <LoginHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-md px-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white mb-4">Invalid Reset Link</h1>
                            <p className="text-gray-400 mb-8">
                                The reset link is invalid or has expired.
                            </p>
                            <Link
                                to="/forgot-password"
                                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                Request New Reset Link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <LoginHeader />
            <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-md px-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-gray-400 mb-6">Create a new password for your account.</p>

                        {success && (
                            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
                                <p className="text-green-400 font-semibold">
                                    ✓ Password reset successfully!
                                </p>
                                <p className="text-green-300 text-sm mt-1">
                                    Redirecting to login...
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                                <p className="text-red-400 font-semibold">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your new password"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Must be at least 8 characters long
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your new password"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mt-6"
                            >
                                {isLoading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>

                        <p className="text-center text-gray-400 text-sm mt-6">
                            Remember your password?{' '}
                            <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
