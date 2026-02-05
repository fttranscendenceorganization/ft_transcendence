import { Link, Route } from 'react-router-dom';
import { useEffect } from 'react';

export default function UserHome() {

    useEffect(() => {
        document.title = "User Home - Netpong";
    }, []);

    const gameModes = [
        {
            id: 1,
            name: 'Zombie Land',
            icon: '🧟',
            description: 'Survive the zombie apocalypse',
            color: 'from-green-500 to-emerald-600',
            players: '0 online',
            route: '/zombie-land',
        },
        {
            id: 2,
            name: 'Barbie Pink',
            icon: '💖',
            description: 'Cute and colorful gameplay',
            color: 'from-pink-500 to-rose-600',
            players: '0 online',
            route: '/barbie-pink',
        },
        {
            id: 3,
            name: 'Soul Society',
            icon: '⚖️',
            description: 'Legal battle royale',
            color: 'from-blue-500 to-cyan-600',
            players: '0 online',
            route: '/soul-society',
        },
        {
            id: 4,
            name: 'Joker',
            icon: '🃏',
            description: 'Chaotic wild card mode',
            color: 'from-purple-500 to-violet-600',
            players: '0 online',
            route: '/joker',
        }
    ];

    return (
        <div className="antialiased bg-[url('/images/fairytale.webp')] w-full bg-cover bg-center bg-no-repeat bg-fixed text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/20 to-slate-900/40 pointer-events-none"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-2 h-2 bg-orange-500/40 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-[15%] w-3 h-3 bg-red-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-60 left-[20%] w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-40 right-[25%] w-2 h-2 bg-orange-400/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <section className="relative px-4 py-12 md:py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center">
                        <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl px-8 md:px-16 py-8 md:py-10 shadow-2xl border border-white/40 hover:border-orange-500/70 transition-all duration-500 hover:shadow-[0_0_60px_rgba(249,115,22,0.4)]">

                            <div className="flex justify-center mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-1 bg-gradient-to-r from-transparent via-orange-500 to-orange-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                    <div className="w-12 h-1 bg-gradient-to-l from-transparent via-orange-500 to-orange-500 rounded-full"></div>
                                </div>
                            </div>

                            <h1 className="text-center text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-red-300 mb-4 leading-tight">
                                Welcome Back, Player! 👋
                            </h1>

                            <p className="text-center text-gray-200 text-base md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
                                Ready to dominate? Choose your game mode and start playing!
                            </p>

                            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-orange-400">0</div>
                                    <div className="text-xs md:text-sm text-gray-400 mt-1">Total Wins</div>
                                </div>
                                <div className="text-center border-x border-white/10">
                                    <div className="text-2xl md:text-3xl font-bold text-red-400">0</div>
                                    <div className="text-xs md:text-sm text-gray-400 mt-1">Games Played</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-violet-400">#0</div>
                                    <div className="text-xs md:text-sm text-gray-400 mt-1">Global Rank</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative px-4 py-12 md:py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center mb-12">
                        <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl px-8 md:px-12 py-6 md:py-8 shadow-2xl border border-white/40 hover:border-red-500/70 transition-all duration-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                            <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl text-center">
                                <span className="text-white font-bold">Choose Your </span>
                                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-400 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                    Game Mode
                                </span>
                            </h2>

                            <div className="flex justify-center mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-red-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <div className="w-16 h-1 bg-gradient-to-l from-transparent via-red-500 to-red-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {gameModes.map((mode) => (
                            <Link
                                key={mode.id}
                                to={mode.route}
                                className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border-2 border-white/30 hover:border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${mode.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <span className="text-4xl">{mode.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white text-xl md:text-2xl font-extrabold mb-1 group-hover:text-orange-400 transition-colors duration-300">
                                                {mode.name}
                                            </h3>
                                            <p className="text-gray-300 text-sm md:text-base">
                                                {mode.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-gray-400 text-sm">{mode.players}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                                        <span>Play Now</span>
                                        <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="flex justify-center mt-8">
                        <Link
                            to="/modes"
                            className="group relative overflow-hidden border-4 border-red-700 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-4 px-8 font-bold rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base hover:scale-105 hover:shadow-[0_0_50px_rgba(220,38,38,0.6)]"
                        >
                            <span className="relative z-10">VIEW ALL MODES</span>
                            <span className="text-xl transition-transform group-hover:translate-x-1 relative z-10">➜</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="relative px-4 py-12 md:py-16">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center mb-12">
                        <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl px-8 md:px-12 py-6 md:py-8 shadow-2xl border border-white/40 hover:border-violet-500/70 transition-all duration-500 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]">
                            <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl text-center">
                                <span className="text-white font-bold">Explore </span>
                                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-500 to-violet-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                                    Exclusive Features
                                </span>
                            </h2>

                            <div className="flex justify-center mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-violet-500 to-violet-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                                    <div className="w-16 h-1 bg-gradient-to-l from-transparent via-violet-500 to-violet-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <Link
                            to="/tournaments"
                            className="group bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border-2 border-orange-500/30 hover:border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-4xl">🏆</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white text-xl md:text-2xl font-extrabold mb-3 group-hover:text-orange-400 transition-colors duration-300">
                                        Live Tournaments
                                    </h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                                        Join ongoing competitions, win roundes, and earn your place in NETPONG history
                                    </p>
                                    <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                                        <span>Enter Now</span>
                                        <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/leaderboard"
                            className="group bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border-2 border-violet-500/30 hover:border-violet-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] cursor-pointer"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-4xl">👑</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white text-xl md:text-2xl font-extrabold mb-3 group-hover:text-violet-400 transition-colors duration-300">
                                        Top Players
                                    </h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                                        See who's dominating the game, track rankings, and challenge the best
                                    </p>
                                    <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                                        <span>View Rankings</span>
                                        <span className="transition-transform duration-300 group-hover:translate-x-2">→</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="flex justify-center">
                        <Link
                            to="/exclusive"
                            className="group relative overflow-hidden border-4 border-orange-500 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-4 px-8 font-bold rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base hover:scale-105 hover:shadow-[0_0_50px_rgba(249,115,22,0.6)]"
                        >
                            <span className="relative z-10">EXPLORE MORE</span>
                            <span className="text-xl transition-transform group-hover:translate-x-1 relative z-10">➜</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}