import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function Home() {

    useEffect(() => {
        document.title = "Home-Netpong";
    }, []);

    return (
        <div className="antialiased bg-[url('/images/fairytale.webp')] w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/20 to-slate-900/40 pointer-events-none"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-2 h-2 bg-orange-500/40 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-[15%] w-3 h-3 bg-red-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-60 left-[20%] w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-40 right-[25%] w-2 h-2 bg-orange-400/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <section className="relative px-4 py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center">
                        <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl px-8 md:px-16 py-10 md:py-14 shadow-2xl border border-white/40 hover:border-orange-500/70 transition-all duration-500 hover:shadow-[0_0_60px_rgba(249,115,22,0.4)] group">

                            <div className="flex justify-center mb-8">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-1 bg-gradient-to-r from-transparent via-orange-500 to-orange-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                                    <div className="w-12 h-1 bg-gradient-to-l from-transparent via-orange-500 to-orange-500 rounded-full"></div>
                                </div>
                            </div>

                            <h1 className="text-center text-3xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-red-300 mb-8 leading-tight">
                                Shaping The Future Of
                            </h1>

                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-orange-500"></div>
                                <h2 className="text-center text-red-400 font-extrabold text-4xl md:text-6xl lg:text-7xl tracking-wider drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
                                    Air Hockey
                                </h2>
                                <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-orange-500"></div>
                            </div>

                            <p className="text-center text-gray-200 text-base md:text-lg lg:text-xl mt-8 max-w-2xl mx-auto leading-relaxed">
                                Experience the next generation of online gaming with <span className="text-orange-400 font-bold">stunning visuals</span> and <span className="text-red-400 font-bold">competitive gameplay</span>
                            </p>

                            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10">
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-orange-400">2+</div>
                                    <div className="text-xs md:text-sm text-gray-400 mt-1">Exclusive Games</div>
                                </div>
                                <div className="text-center border-x border-white/10">
                                    <div className="text-2xl md:text-3xl font-bold text-red-400">4</div>
                                    <div className="text-xs md:text-sm text-gray-400 mt-1">Game Modes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-violet-400">100%</div>
                                    <div className="text-xs md:text-sm text-gray-400 mt-1">Free to Play</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-12">
                        <a href="/exclusive" className="group relative overflow-hidden border-4 border-orange-500 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-4 px-8 font-bold rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base hover:scale-105 hover:shadow-[0_0_50px_rgba(249,115,22,0.6)]">
                            <span className="relative z-10">EXPLORE MORE</span>
                            <span className="text-xl transition-transform group-hover:translate-x-1 relative z-10">➜</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </a>

                        <a href="/modes" className="group relative overflow-hidden border-4 border-red-700 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-4 px-8 font-bold rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base hover:scale-105 hover:shadow-[0_0_50px_rgba(220,38,38,0.6)]">
                            <span className="relative z-10">BROWSE MODES</span>
                            <span className="text-xl transition-transform group-hover:translate-x-1 relative z-10">➜</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </a>
                    </div>
                </div>
            </section>

            <section className="relative px-4 py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center mb-16">
                        <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl px-8 md:px-12 py-8 md:py-10 shadow-2xl border border-white/40 hover:border-red-500/70 transition-all duration-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.4)]">
                            <h2 className="font-sans text-2xl md:text-4xl lg:text-5xl text-center">
                                <span className="text-white font-bold">Join The Big Game Of </span>
                                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-400 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                    NETPONG
                                </span>
                            </h2>

                            <div className="flex justify-center mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-red-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <div className="w-16 h-1 bg-gradient-to-l from-transparent via-red-500 to-red-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-white/30 hover:border-orange-500/70 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] group">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-red-700 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">⚡</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-lg md:text-xl font-extrabold mb-3 group-hover:text-orange-400 transition-colors duration-300">Next-Gen Experience</h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        <span className="font-bold text-red-400">NETPONG</span> delivers cutting-edge online Air Hockey gameplay with modern design and innovative features.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-white/30 hover:border-orange-500/70 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] group">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">🎮</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-lg md:text-xl font-extrabold mb-3 group-hover:text-orange-400 transition-colors duration-300">Unique Game Modes</h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        Explore creative modes designed for everyone. Challenge your skills in ways you've never experienced before.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-white/30 hover:border-orange-500/70 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] group">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">👥</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-lg md:text-xl font-extrabold mb-3 group-hover:text-orange-400 transition-colors duration-300">Play With Friends</h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        Challenge your friends, compete remotely, and rise through the ranks in an engaging competitive environment.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-white/30 hover:border-orange-500/70 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] group">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-3xl">🎯</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-lg md:text-xl font-extrabold mb-3 group-hover:text-orange-400 transition-colors duration-300">Precision & Fun</h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        <span className="font-bold text-red-400">NETPONG</span> combines speed, precision, and excitement - all delivered right to your screen.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-16">
                        <div className="bg-slate-900/40 backdrop-blur-sm rounded-3xl px-8 md:px-12 py-10 md:py-12 shadow-2xl border border-white/40 text-center max-w-3xl hover:border-amber-500/70 transition-all duration-500 hover:shadow-[0_0_50px_rgba(245,158,11,0.4)] group">

                            <div className="flex justify-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">🏆</span>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-2xl">⚡</span>
                                </div>
                            </div>

                            <p className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-8 leading-relaxed">
                                Choose your mode, sharpen your skills, and join the community shaping the <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 italic">future of Air Hockey</span>
                            </p>

                            <a href="/signup" className="group/btn inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-5 px-12 font-bold rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 text-base md:text-lg hover:scale-105 hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] border-4 border-amber-700 relative overflow-hidden">
                                <span className="relative z-10">JOIN NOW</span>
                                <span className="text-2xl transition-transform group-hover/btn:translate-x-1 relative z-10">➜</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            </a>

                            <p className="text-gray-400 text-sm mt-6">
                                No Premium Plans required • Start playing instantly
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}