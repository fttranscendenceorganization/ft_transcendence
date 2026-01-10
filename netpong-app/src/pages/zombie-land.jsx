import { useState } from 'react';
import { useEffect } from 'react';
import ZombieLandHeader from '../components/ZombieLandHeader';

export default function ZombieLand() {

    useEffect(() => {
        document.title = "Zombie Land-Netpong";

        const link = document.querySelector("link[rel~='icon']");
        if (link) {
            link.href = "/zombie.svg";
        }

        return () => {
            document.title = "NetPong";
            if (link) {
                link.href = "/netpong.svg";
            }
        };
    }, []);

    const [isHovering, setIsHovering] = useState(false);

    const handleStartGame = () => {
        alert('Starting Zombie Land!');
    };

    return (
        <div className="antialiased bg-slate-900 w-full min-h-screen text-white overflow-x-hidden relative">
            <div className="absolute inset-0 bg-[url('/images/zombie.jpg')] bg-center bg-no-repeat bg-cover"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/90"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-green-500/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    ></div>
                ))}
            </div>

            <ZombieLandHeader />

            <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-7xl mx-auto">

                    <div className="order-2 md:order-1">
                        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 md:p-10 shadow-2xl border border-green-500/30 hover:border-green-500/50 transition-all duration-500 hover:shadow-green-500/20">

                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/50 rounded-full px-4 py-2 mb-6 hover:scale-105 transition-transform">
                                <svg className="w-4 h-4 text-green-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                                </svg>
                                <span className="text-xs md:text-sm font-bold text-green-300">A <span className="text-red-400">NETPONG</span> Original Game</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                                <span className="block text-green-400 drop-shadow-[0_0_25px_rgba(34,197,94,0.8)] hover:drop-shadow-[0_0_35px_rgba(34,197,94,1)] transition-all duration-300">SEE YOU</span>
                                <span className="block text-white drop-shadow-lg my-1">AT THE</span>
                                <span className="block text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)] hover:drop-shadow-[0_0_35px_rgba(239,68,68,1)] transition-all duration-300">GRAVE</span>
                            </h1>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-1 w-16 bg-gradient-to-r from-green-500 via-green-400 to-transparent rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                <div className="h-1 flex-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-full"></div>
                            </div>

                            <p className="text-xl md:text-2xl font-bold text-green-300 mb-4 animate-pulse">A Life To Fight For</p>

                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="bg-green-900/30 rounded-lg p-3 text-center border border-green-500/30">
                                    <div className="text-2xl font-bold text-green-400">99+</div>
                                    <div className="text-xs text-gray-400">Cures</div>
                                </div>
                                <div className="bg-red-900/30 rounded-lg p-3 text-center border border-red-500/30">
                                    <div className="text-2xl font-bold text-red-400">∞</div>
                                    <div className="text-xs text-gray-400">Zombies</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-gray-500/30">
                                    <div className="text-2xl font-bold text-yellow-400">4.9</div>
                                    <div className="text-xs text-gray-400">Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 md:p-10 shadow-2xl border border-green-500/30 hover:border-green-500/50 transition-all duration-500 hover:shadow-green-500/20">

                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 text-sm md:text-base">
                                <span className="bg-gradient-to-r from-green-900/70 to-green-800/70 text-green-300 px-3 py-1 rounded-lg font-bold border border-green-500/50 hover:scale-105 transition-transform">2026</span>
                                <span className="bg-gradient-to-r from-red-900/70 to-red-800/70 text-red-300 px-3 py-1 rounded-lg font-bold border border-red-500/50 hover:scale-105 transition-transform">1337</span>
                                <span className="bg-slate-800/70 text-gray-300 px-3 py-1 rounded-lg font-bold hover:bg-slate-700/70 transition-colors">Horror</span>
                                <span className="bg-slate-800/70 text-gray-300 px-3 py-1 rounded-lg font-bold hover:bg-slate-700/70 transition-colors">Action</span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">A Life To Fight For</h2>

                            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8">
                                When humanity is gone and nothing is left but the undead, you must fight for survival. Make air hockey the only cure to survive in this apocalyptic world where every match could be your last.
                            </p>

                            <div className="space-y-3 mb-8">
                                {[
                                    { text: 'Survive against waves of zombies' },
                                    { text: 'Intense air hockey combat mechanics' },
                                    { text: 'Post-apocalyptic environments' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 group hover:translate-x-2 transition-transform">
                                        <div className="flex items-center justify-center w-6 h-6 bg-green-500/20 rounded-full flex-shrink-0 mt-1 group-hover:bg-green-500/30 transition-colors">
                                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-300 text-sm md:text-base group-hover:text-white transition-colors">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleStartGame}
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                className="group relative w-full bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white py-4 px-8 font-bold rounded-xl shadow-2xl shadow-green-500/50 transition-all duration-300 text-base md:text-lg hover:scale-105 hover:shadow-green-500/70 border-2 border-green-400/50 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <svg className={`w-6 h-6 transition-transform ${isHovering ? 'scale-110 rotate-12' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                </svg>
                                <span className="relative z-10">START PLAYING</span>
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <span>15 min avg</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                    </svg>
                                    <span>Multi Player</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}