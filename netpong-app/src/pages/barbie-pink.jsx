import { useState } from 'react';
import BarbiePinkHeader from "../components/BarbiePinkHeader";

export default function BarbiePink() {
    const [isHovering, setIsHovering] = useState(false);

    const handleStartGame = () => {
        alert('Starting Barbie Pink!');
    };

    return (
        <div className="antialiased bg-slate-900 w-full min-h-screen text-white overflow-x-hidden relative">
            <div className="absolute inset-0 bg-[url('/images/barbie.jpg')] bg-center bg-no-repeat bg-cover"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-pink-950/40 via-rose-950/20 to-slate-900/60"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-pink-400/30 rounded-full blur-sm"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `pulse ${4 + Math.random() * 4}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    ></div>
                ))}
            </div>

            <BarbiePinkHeader />

            <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-7xl mx-auto">

                    <div className="order-2 md:order-1">
                        <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 md:p-10 shadow-2xl border border-pink-500/30 hover:border-pink-400/50 transition-all duration-500 hover:shadow-pink-500/20">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-900/40 to-rose-800/40 border border-pink-600/50 rounded-full px-4 py-2 mb-6 hover:scale-105 transition-transform">
                                <svg className="w-4 h-4 text-pink-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                                </svg>
                                <span className="text-xs md:text-sm font-bold text-pink-200">A <span className="text-pink-400">NETPONG</span> Original Game</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                                <span className="block text-pink-300 drop-shadow-[0_0_25px_rgba(244,114,182,0.8)] hover:drop-shadow-[0_0_35px_rgba(244,114,182,1)] transition-all duration-300">BEAUTIFUL</span>
                                <span className="block text-white drop-shadow-lg my-1">PINK</span>
                                <span className="block text-rose-400 drop-shadow-[0_0_25px_rgba(251,113,133,0.8)] hover:drop-shadow-[0_0_35px_rgba(251,113,133,1)] transition-all duration-300">ROSE</span>
                            </h1>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-1 w-16 bg-gradient-to-r from-pink-400 via-rose-300 to-transparent rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
                                <div className="h-1 flex-1 bg-gradient-to-r from-pink-400/50 to-transparent rounded-full"></div>
                            </div>

                            <p className="text-xl md:text-2xl font-bold text-pink-300 mb-4 animate-pulse">A World To Love</p>

                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="bg-pink-900/20 rounded-lg p-3 text-center border border-pink-500/30">
                                    <div className="text-2xl font-bold text-pink-300">P_I_N_K</div>
                                    <div className="text-xs text-pink-400">Outfits</div>
                                </div>
                                <div className="bg-rose-900/30 rounded-lg p-3 text-center border border-rose-500/30">
                                    <div className="text-2xl font-bold text-rose-400">10k+</div>
                                    <div className="text-xs text-pink-400">Friends</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-pink-500/30">
                                    <div className="text-2xl font-bold text-white">4.9</div>
                                    <div className="text-xs text-pink-400">Rating</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 md:p-10 shadow-2xl border border-pink-500/30 hover:border-pink-400/50 transition-all duration-500 hover:shadow-pink-500/20">
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 text-sm md:text-base">
                                <span className="bg-gradient-to-r from-pink-800/70 to-rose-700/70 text-pink-200 px-3 py-1 rounded-lg font-bold border border-pink-600/50 hover:scale-105 transition-transform">2026</span>
                                <span className="bg-gradient-to-r from-rose-900/70 to-rose-800/70 text-rose-300 px-3 py-1 rounded-lg font-bold border border-rose-500/50 hover:scale-105 transition-transform">1337</span>
                                <span className="bg-slate-800/70 text-pink-200 px-3 py-1 rounded-lg font-bold hover:bg-slate-700/70 transition-colors">Girls</span>
                                <span className="bg-slate-800/70 text-pink-200 px-3 py-1 rounded-lg font-bold hover:bg-slate-700/70 transition-colors">Lovely</span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">A World To Love</h2>

                            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8">
                                Welcome to Barbie Pink, a magical world designed especially for girls. Play, create friendships, and make the world a better place through the power of air hockey and love.
                            </p>

                            <div className="space-y-3 mb-8">
                                {[
                                    { text: 'Collect beautiful outfits and accessories' },
                                    { text: 'Fun and friendly air hockey matches' },
                                    { text: 'Colorful dreamlike environments' }
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 group hover:translate-x-2 transition-transform">
                                        <div className="flex items-center justify-center w-6 h-6 bg-pink-500/20 rounded-full flex-shrink-0 mt-1 group-hover:bg-pink-500/30 transition-colors">
                                            <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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
                                className="group relative w-full bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 hover:from-pink-500 hover:via-rose-400 hover:to-pink-500 text-white py-4 px-8 font-bold rounded-xl shadow-2xl shadow-pink-500/50 transition-all duration-300 text-base md:text-lg hover:scale-105 hover:shadow-pink-600/70 border-2 border-pink-400/50 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <svg className={`w-6 h-6 transition-transform ${isHovering ? 'scale-110 rotate-12' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                </svg>
                                <span className="relative z-10">START PLAYING</span>
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <span>15  min avg</span>
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