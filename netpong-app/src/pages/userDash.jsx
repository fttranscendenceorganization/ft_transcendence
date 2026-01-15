import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {

    useEffect(() => {
        document.title = "Profile-Netpong";
    }, []);

    const navigate = useNavigate();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        // My example for the data returned by the backend used from login page
        const MyUserData = {
            firstName: "Ahmed",
            lastName: "Ahlaqqach",
            username: "aahlaqqa",
            email: "ahmed@gmail.com",
            avatar: "A", // we can use this and replace it with an avatar later instead of the letter
            wins: 14,
            losses: 5,
            points: 245,
            rank: "Diamond",
            level: 42,
            favoriteGame: "Zombie Land",
            joinDate: "January 2026",
            winRate: 73.9
        };

        setTimeout(() => {
            setUserData(MyUserData);
            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/user.jpg')] bg-center bg-no-repeat bg-cover bg-fixed"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-2 h-2 bg-orange-500/40 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-[15%] w-3 h-3 bg-red-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 left-[20%] w-2 h-2 bg-violet-500/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            </div>

            <header className="relative w-full bg-slate-900/95 backdrop-blur-md py-4 flex items-center justify-between px-4 md:px-6 z-20 shadow-lg border-b border-white/10">
                <a href="/" className="flex items-center group">
                    <img src="/images/netpong.svg" alt="NETPONG Logo" className="h-8 md:h-10 w-auto transition-transform group-hover:scale-110" />
                </a>
                <div className="flex items-center gap-4">
                    <a href="/chat" className="text-white hover:text-orange-400 font-bold transition">Chat</a>
                    <button
                        onClick={() => navigate('/logout')}
                        className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="relative container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">

                    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white/30 mb-8 hover:border-orange-500/50 transition-all duration-500">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

                            <div className="relative group">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-6xl md:text-7xl font-extrabold text-white">{userData.avatar}</span>
                                </div>
                                <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-slate-900 rounded-full"></div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-4">
                                    <span className="text-xs md:text-sm font-bold text-orange-400 uppercase tracking-wider">Level {userData.level} • {userData.rank}</span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
                                    {userData.firstName} {userData.lastName}
                                </h1>

                                <p className="text-xl md:text-2xl text-gray-400 mb-4">@{userData.username}</p>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm md:text-base">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-300">{userData.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-300">Joined {userData.joinDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-col gap-4">
                                <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-3 px-6 font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-105">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover:scale-105 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl md:text-4xl font-extrabold text-green-400 mb-1">{userData.wins}</div>
                            <div className="text-sm text-gray-400 font-semibold">Wins</div>
                        </div>

                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-red-500/30 hover:border-red-500/60 transition-all duration-300 hover:scale-105 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl md:text-4xl font-extrabold text-red-400 mb-1">{userData.losses}</div>
                            <div className="text-sm text-gray-400 font-semibold">Losses</div>
                        </div>

                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 hover:scale-105 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl md:text-4xl font-extrabold text-orange-400 mb-1">{userData.points}</div>
                            <div className="text-sm text-gray-400 font-semibold">Points</div>
                        </div>

                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-violet-500/30 hover:border-violet-500/60 transition-all duration-300 hover:scale-105 group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-3xl md:text-4xl font-extrabold text-violet-400 mb-1">{userData.winRate}%</div>
                            <div className="text-sm text-gray-400 font-semibold">Win Rate</div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/30 hover:border-green-500/50 transition-all duration-300">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-2xl">🎮</span>
                                Favorite Game
                            </h3>
                            <p className="text-2xl font-extrabold text-green-400">{userData.favoriteGame}</p>
                            <p className="text-gray-400 mt-2">Most played mode</p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <a
                            href="/modes"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-4 px-8 font-bold rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
                        >
                            <span>Start Playing</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}