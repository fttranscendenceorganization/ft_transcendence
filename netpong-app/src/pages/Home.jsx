import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authFetch } from '../utils/api';

export default function UserHome() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "User Home - NetPong";

        (async () => {
            try {
                const res = await authFetch('/api/auth/me', { method: 'GET' });
                if (!res.ok) {
                    navigate('/login');
                    return;
                }
                const data = await res.json();

                const wins = data.wins;
                const losses = data.losses;
                const winRate = data.winrate;
                const xp = data.points;
                const level = data.level ?? 1;
                const xpNext = level * 100;
                const totalXp= data.totalXp;

                setUser({
                    firstName: data.firstName,
                    username: data.username,
                    avatar: data.avatarUrl ?? '/images/avatar.jpg',
                    level,
                    xp,
                    xpNext,
                    wins,
                    losses,
                    winRate,
                    totalXp,
                    online: true,
                });

                setLoading(false);
            } catch (err) {
                console.error('Failed loading user home', err);
                navigate('/login');
            }
        })();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading Player Hub...</div>
            </div>
        );
    }

    const xpPercent = Math.min(100, Math.round((user.xp / user.xpNext) * 100));

    return (
        <div className="antialiased bg-[url('/images/user.jpg')] w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/60 pointer-events-none"></div>

            <section className="relative px-4 pt-16 pb-10">
                <div className="max-w-5xl mx-auto flex justify-center">
                    <div className="bg-slate-900/60 backdrop-blur-lg rounded-3xl px-8 md:px-16 py-10 shadow-2xl border border-white/30 hover:border-orange-500/70 transition-all duration-700 hover:shadow-[0_0_80px_rgba(249,115,22,0.45)] w-full animate-fadeInUp">

                        <div className="flex flex-col md:flex-row items-center gap-8">

                            <div className="flex flex-col md:flex-row items-center gap-8 flex-1">

                                <div className="relative group">
                                    <div className="absolute inset-0 rounded-full blur-xl bg-orange-500/40 group-hover:bg-orange-500/70 transition-all"></div>
                                    <img
                                        src={user.avatar}
                                        alt="User Avatar"
                                        className="relative w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-orange-500 shadow-2xl"
                                    />
                                    <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 border-2 border-slate-900 rounded-full shadow-lg animate-pulse"></span>
                                </div>

                                <div className="text-center md:text-left flex-1">
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-red-300 leading-tight">
                                        Welcome Back, {user.firstName}
                                    </h1>

                                    <p className="text-gray-300 mt-2 text-sm md:text-base">
                                        @{user.username}
                                    </p>

                                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
                                        <StatChip label="Level" value={user.level} color="orange" />
                                        <StatChip label="Win Rate" value={`${user.winRate}%`} color="violet" />
                                        <StatChip label="Wins" value={user.wins} color="green" />
                                        <StatChip label="Losses" value={user.losses} color="red" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex md:flex-col gap-4">
                                <button
                                    onClick={() => navigate('/editprofile')}
                                    className="bg-gradient-to-r from-orange-600 to-red-600 
                                               hover:from-orange-500 hover:to-red-500 
                                               text-white py-3 px-6 font-bold rounded-xl 
                                               shadow-lg transition-all duration-300 
                                               hover:scale-105"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex justify-between text-sm text-gray-300 mb-2">
                                <span>XP Progress</span>
                                <span>{user.xp} / {user.xpNext} XP</span>
                            </div>

                            <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${xpPercent}%` }}
                                ></div>
                            </div>

                            <p className="text-right text-xs text-gray-400 mt-1">
                                {xpPercent}%
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative px-4 py-12">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">

                    <Link
                        to="/modes"
                        className="group bg-slate-900/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-red-500/40 hover:border-red-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(220,38,38,0.6)]"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                <span className="text-5xl">🎮</span>
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-extrabold group-hover:text-red-400 transition-colors">
                                    Game Modes
                                </h2>
                                <p className="text-gray-300 mt-2">
                                    Zombie Land, Joker, and more
                                </p>
                                <div className="mt-4 text-red-400 font-bold flex items-center gap-2">
                                    <span>Play Now</span>
                                    <span className="transition-transform group-hover:translate-x-2">→</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/exclusive"
                        className="group bg-slate-900/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-violet-500/40 hover:border-violet-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(139,92,246,0.6)]"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                <span className="text-5xl">✨</span>
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-extrabold group-hover:text-violet-400 transition-colors">
                                    Exclusive Features
                                </h2>
                                <p className="text-gray-300 mt-2">
                                    Tournaments & leaderboard
                                </p>
                                <div className="mt-4 text-violet-400 font-bold flex items-center gap-2">
                                    <span>Explore</span>
                                    <span className="transition-transform group-hover:translate-x-2">→</span>
                                </div>
                            </div>
                        </div>
                    </Link>

                </div>
            </section>
        </div>
    );
}

// I will use this function here later as a components 
function StatChip({ label, value, color }) {
    const colorMap = {
        orange: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        violet: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
        green: 'bg-green-500/20 text-green-300 border-green-500/40',
        red: 'bg-red-500/20 text-red-300 border-red-500/40',
        pink: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    };

    return (
        <div className={`px-4 py-1.5 rounded-full border text-sm font-semibold shadow ${colorMap[color]}`}>
            {label}: <span className="ml-1 font-extrabold">{value}</span>
        </div>
    );
}
