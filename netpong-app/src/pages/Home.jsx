import Header from '../components/Header';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="antialiased bg-[url('/images/fairytale.webp')] w-full min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white">

            <section className="relative px-4 py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center">
                        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl px-8 md:px-16 py-10 md:py-14 shadow-2xl border border-white/20 hover:border-orange-500/50 transition-all duration-500">
                            <h1 className="text-center text-3xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-red-300 mb-6">
                                Shaping The Future Of
                            </h1>

                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-orange-500"></div>
                                <h2 className="text-center text-red-400 font-extrabold text-4xl md:text-6xl lg:text-7xl tracking-wider drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                                    Air Hockey
                                </h2>
                                <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-orange-500"></div>
                            </div>

                            <p className="text-center text-gray-300 text-base md:text-lg mt-6 max-w-2xl mx-auto">
                                Experience the next generation of online gaming with stunning visuals and competitive gameplay
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 mt-12">
                        <Link to="/exclusive" className="group relative overflow-hidden border-4 border-orange-500 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white py-4 px-8 font-bold rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base hover:scale-105 hover:shadow-orange-500/50">
                            <span className="relative z-10">EXPLORE MORE</span>
                            <span className="text-xl transition-transform group-hover:translate-x-1">➜</span>
                        </Link>

                        <Link to="/modes" className="group relative overflow-hidden border-4 border-red-700 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-4 px-8 font-bold rounded-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base hover:scale-105 hover:shadow-red-500/50">
                            <span className="relative z-10">BROWSE MODES</span>
                            <span className="text-xl transition-transform group-hover:translate-x-1">➜</span>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="relative px-4 py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center mb-12">
                        <div className="bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl px-8 md:px-12 py-6 md:py-8 shadow-2xl border border-white/20">
                            <h2 className="font-sans text-2xl md:text-4xl lg:text-5xl text-center">
                                <span className="text-white font-bold">Join The Big Game Of </span>
                                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                    NETPONG
                                </span>
                            </h2>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-red-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">⚡</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-lg md:text-xl font-extrabold mb-2">Next-Gen Experience</h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        <span className="font-bold text-red-400">NETPONG</span> delivers cutting-edge online Air Hockey gameplay with modern design and innovative features.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">🎮</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-lg md:text-xl font-extrabold mb-2">Unique Game Modes</h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        Explore creative modes designed for everyone. Challenge your skills in ways you've never experienced before.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">👥</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-lg md:text-xl font-extrabold mb-2">Play With Friends</h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        Challenge your friends, compete remotely, and rise through the ranks in an engaging competitive environment.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/10 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <div>
                                    <h3 className="text-white text-lg md:text-xl font-extrabold mb-2">Precision & Fun</h3>
                                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                        <span className="font-bold text-red-400">NETPONG</span> combines speed, precision, and excitement - all delivered right to your screen.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-12">
                        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl px-8 md:px-12 py-8 md:py-10 shadow-2xl border border-white/20 text-center max-w-3xl">
                            <p className="text-white text-lg md:text-xl font-bold mb-6 leading-relaxed">
                                Choose your mode, sharpen your skills, and join the community shaping the <span className="text-red-400 italic">future of Air Hockey</span>
                            </p>

                            <Link to="/signup" className="group inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white py-4 px-10 font-bold rounded-xl shadow-2xl transition-all duration-300 text-base md:text-lg hover:scale-105 hover:shadow-amber-500/50 border-4 border-amber-700">
                                <span>JOIN NOW</span>
                                <span className="text-2xl transition-transform group-hover:translate-x-1">➜</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}