import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Exclusive() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Exclusive Features - NetPong";
    }, []);

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="antialiased w-full min-h-screen overflow-x-hidden relative bg-slate-950">

            <div className="absolute inset-0 bg-[url('/images/air.jpg')] bg-center bg-no-repeat bg-cover bg-fixed"></div>

            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/60"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500/30 rounded-full animate-ping"></div>
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-violet-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-red-400/20 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="relative w-full min-h-screen overflow-hidden flex items-center justify-center py-20">
                <div className={`relative z-10 flex flex-col items-center justify-center text-white px-4 md:px-6 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl px-6 md:px-12 py-10 md:py-14 shadow-2xl border border-white/20 max-w-5xl transition-all duration-500 hover:bg-slate-900/60 hover:shadow-[0_0_50px_rgba(139,92,246,0.3)] hover:border-violet-500/40 group">

                        <div className="inline-block mb-6">
                            <div className="bg-gradient-to-r from-red-500 to-violet-500 text-white text-xs md:text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                                Exclusive Access
                            </div>
                        </div>

                        <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-wide relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-500 mb-6 animate-pulse">
                            COMPETE & DOMINATE
                        </p>

                        <div className="flex items-center justify-center gap-2 mb-8">
                            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full"></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full"></div>
                        </div>

                        <p className="font-bold text-lg md:text-2xl lg:text-3xl mt-6 md:mt-8 tracking-wider text-white/90 leading-relaxed">
                            <a
                                href="/"
                                className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 transition-all duration-300 inline-block hover:scale-110"
                            >
                                NETPONG
                            </a>
                            <span className="text-white/70"> — </span>
                            EXCLUSIVE COMPETITIVE FEATURES
                            <br className="hidden md:block" />
                            <span className="text-violet-400 font-extrabold">PROVE YOUR SKILLS</span>
                        </p>

                        <p className="text-white/60 text-sm md:text-base mt-6 max-w-2xl mx-auto leading-relaxed">
                            Join intense tournaments, compete against the best players worldwide,
                            and climb the leaderboards. Show everyone what you're made of!
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mt-12 mb-10">

                            <button
                                onClick={() => navigate('/tournaments')}
                                className="group/card bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-orange-500/30 hover:border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] cursor-pointer text-left"
                            >
                                <div className="text-5xl mb-4 transition-transform duration-300 group-hover/card:scale-110">🏆</div>
                                <h3 className="font-bold text-xl md:text-2xl text-white mb-3">Players History</h3>
                                <p className="text-white/70 text-sm md:text-base mb-4">
                                    Join to see latest competitions state, see your opponent points, and earn your place in NETPONG history
                                </p>
                                <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
                                    <span>Enter Now</span>
                                    <span className="transition-transform duration-300 group-hover/card:translate-x-2">→</span>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/leaderboard')}
                                className="group/card bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-violet-500/30 hover:border-violet-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] cursor-pointer text-left"
                            >
                                <div className="text-5xl mb-4 transition-transform duration-300 group-hover/card:scale-110">👑</div>
                                <h3 className="font-bold text-xl md:text-2xl text-white mb-3">Top Players</h3>
                                <p className="text-white/70 text-sm md:text-base mb-4">
                                    See who's dominating the game, track rankings, and challenge the best
                                </p>
                                <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
                                    <span>View Rankings</span>
                                    <span className="transition-transform duration-300 group-hover/card:translate-x-2">→</span>
                                </div>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10 mb-10 text-xs md:text-sm">
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 hover:border-violet-500/40 transition-all duration-300 hover:bg-white/10">
                                <div className="text-xl md:text-2xl mb-2">⚔️</div>
                                <div className="font-semibold text-white/80">Real Competition</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 hover:border-violet-500/40 transition-all duration-300 hover:bg-white/10">
                                <div className="text-xl md:text-2xl mb-2">🎯</div>
                                <div className="font-semibold text-white/80">Global Rankings</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 hover:border-violet-500/40 transition-all duration-300 hover:bg-white/10">
                                <div className="text-xl md:text-2xl mb-2">💎</div>
                                <div className="font-semibold text-white/80">Exclusive Modes</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/10 hover:border-violet-500/40 transition-all duration-300 hover:bg-white/10">
                                <div className="text-xl md:text-2xl mb-2">⚡</div>
                                <div className="font-semibold text-white/80">Live Updates</div>
                            </div>
                        </div>

                        <div className="mt-8 md:mt-10">
                            <a
                                href="/modes"
                                className="relative overflow-hidden group/btn border-2 border-violet-500 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white py-4 px-8 md:px-12 text-lg md:text-xl font-bold rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] active:scale-95"
                            >
                                <span className="relative z-10">GET STARTED</span>
                                <span className="relative z-10 text-xl md:text-2xl transition-transform duration-300 group-hover/btn:translate-x-1">➜</span>

                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            </a>
                        </div>

                        <p className="text-white/50 text-xs md:text-sm mt-6">
                            Free to join • No premium required • Compete now
                        </p>
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}