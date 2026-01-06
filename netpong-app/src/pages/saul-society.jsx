import SaulHeader from '../components/SaulHeader';

export default function SaulSociety() {
    const handleStartGame = () => {
        alert('Starting Saul Society!');
    };

    return (
        <div className="antialiased bg-slate-900 w-full min-h-screen text-white overflow-x-hidden relative bg-[url('/images/sword.jpg')] bg-center bg-no-repeat bg-cover">

            <SaulHeader />

            <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center max-w-7xl mx-auto">

                    <div className="order-2 md:order-1">
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-500/30">
                            <div className="inline-flex items-center gap-2 bg-gray-800/70 border border-gray-600/50 rounded-full px-4 py-2 mb-6">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
                                </svg>
                                <span className="text-xs md:text-sm font-bold text-gray-300">A <span className="text-red-400">NETPONG</span> Original Game</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                                <span className="block text-gray-300 drop-shadow-[0_0_20px_rgba(209,213,219,0.6)]">HONOR</span>
                                <span className="block text-white drop-shadow-lg">FIGHT</span>
                                <span className="block text-gray-500 drop-shadow-[0_0_20px_rgba(107,114,128,0.6)]">SAUL</span>
                            </h1>

                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-1 w-16 bg-gradient-to-r from-gray-400 to-transparent rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="h-1 flex-1 bg-gradient-to-r from-gray-400/50 to-transparent rounded-full"></div>
                            </div>

                            <p className="text-xl md:text-2xl font-bold text-gray-300 mb-4">A Life To Save</p>
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-500/30">
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 text-sm md:text-base">
                                <span className="bg-gray-700/70 text-gray-300 px-3 py-1 rounded-lg font-bold border border-gray-600/50">2026</span>
                                <span className="bg-red-900/50 text-red-300 px-3 py-1 rounded-lg font-bold border border-red-500/50">1337</span>
                                <span className="bg-slate-800 text-gray-300 px-3 py-1 rounded-lg font-bold">Adventure</span>
                                <span className="bg-slate-800 text-gray-300 px-3 py-1 rounded-lg font-bold">Action</span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">A Life To Save</h2>

                            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8">
                                The chosen hero that the world needs to save them from a massive evil that wants to consume people's souls. Air Hockey becomes the legendary weapon needed to defeat this ancient darkness and restore light to humanity.
                            </p>

                            <div className="space-y-3 mb-8">
                                {['Save as many souls as you can', 'Master legendary air hockey combat', 'Epic fantasy environments'].map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <svg className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <span className="text-gray-300 text-sm md:text-base">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleStartGame}
                                className="group w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-8 font-bold rounded-xl shadow-2xl shadow-gray-700/50 transition-all duration-300 text-base md:text-lg hover:scale-105 border-2 border-gray-600/50 flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                </svg>
                                <span>START PLAYING</span>
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}