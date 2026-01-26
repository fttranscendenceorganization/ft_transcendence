import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginHeader from '../components/loginHeader';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Forgot Password - Netpong";

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
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setSuccess(true);
        }, 2000);
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
                        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />

                <div className="relative z-10">


                    <div className="container mx-auto px-4 py-8 md:py-16 max-w-md">
                        {!success ? (
                            <div className="group">
                                <div className="relative bg-slate-900/60 backdrop-blur-2xl rounded-3xl px-8 py-10 shadow-2xl border border-violet-500/30 hover:border-violet-400/50 transition-all duration-500 hover:shadow-violet-500/20 hover:shadow-3xl">
                                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/0 via-purple-500/0 to-violet-500/0 group-hover:from-violet-500/10 group-hover:via-purple-500/5 group-hover:to-violet-500/10 transition-all duration-500" />

                                    <div className="relative">
                                        <div className="flex justify-center mb-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse" />
                                                <div className="relative bg-gradient-to-br from-violet-600 to-purple-600 p-4 rounded-2xl shadow-xl">
                                                    <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
                                            Forgot Password?
                                        </h1>

                                        <p className="text-zinc-400 text-center mb-8 text-sm leading-relaxed">
                                            No worries, we'll send you reset instructions to your email
                                        </p>

                                        {error && (
                                            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 backdrop-blur-sm animate-shake">
                                                <div className="flex items-center gap-3">
                                                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                                    </svg>
                                                    <p className="text-red-200 text-sm font-medium">{error}</p>
                                                </div>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="relative group/input">
                                                <label className="block text-sm font-semibold text-zinc-300 mb-2 ml-1">
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl blur-sm opacity-0 group-hover/input:opacity-100 transition-opacity duration-300" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                        disabled={isLoading}
                                                        placeholder="Enter your email"
                                                        className="relative w-full bg-slate-800/50 text-white px-4 pl-12 py-3.5 rounded-xl border border-slate-700 backdrop-blur-sm shadow-lg hover:bg-slate-800/70 hover:border-violet-500/50 focus:outline-none focus:border-violet-500 focus:bg-slate-800/70 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-zinc-500"
                                                    />
                                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="group/button relative w-full overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white py-3.5 px-6 font-bold rounded-xl shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-violet-500/50 border border-violet-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover/button:translate-x-[200%] transition-transform duration-700" />
                                                <span className="relative flex items-center justify-center gap-2">
                                                    {isLoading ? (
                                                        <>
                                                            <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                            </svg>
                                                            Sending Instructions...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Reset Password
                                                            <svg className="w-5 h-5 transition-transform group-hover/button:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                                            </svg>
                                                        </>
                                                    )}
                                                </span>
                                            </button>
                                        </form>

                                        <div className="mt-8 pt-6 border-t border-slate-700/50">
                                            <Link
                                                to="/login"
                                                className="group/link flex items-center justify-center gap-2 text-violet-400 hover:text-violet-300 transition-colors text-sm font-semibold"
                                            >
                                                <svg className="w-4 h-4 transition-transform group-hover/link:-translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                                </svg>
                                                Back to Login
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative bg-slate-900/60 backdrop-blur-2xl rounded-3xl px-8 py-10 shadow-2xl border border-green-500/30 animate-fade-in">
                                <div className="text-center">
                                    <div className="flex justify-center mb-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                                            <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 p-4 rounded-2xl shadow-xl">
                                                <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                                    <p className="text-zinc-400 mb-2 text-sm">
                                        We've sent password reset instructions to
                                    </p>
                                    <p className="text-violet-400 font-semibold mb-8">
                                        {email}
                                    </p>

                                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                                        <p className="text-zinc-300 text-sm leading-relaxed">
                                            Didn't receive the email? Check your spam folder or click below to resend.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setSuccess(false)}
                                            className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 px-6 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            Resend Email
                                        </button>
                                        <Link
                                            to="/login"
                                            className="block w-full bg-slate-800 hover:bg-slate-700 text-white py-3 px-6 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] border border-slate-700"
                                        >
                                            Back to Login
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
            `}</style>
            </div>
        </div>
    );
}