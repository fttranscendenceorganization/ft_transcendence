import { useEffect } from "react";

export default function Error404() {

    useEffect(() => {
        document.title = "Error 404-Netpong";

        const link = document.querySelector("link[rel~='icon']");
        if (link) {
            link.href = "/netpong.svg";
        }

        return () => {
            document.title = "NetPong";
            if (link) {
                link.href = "/netpong.svg";
            }
        };

    }, []);

    return (
        <div className="antialiased w-full min-h-screen overflow-x-hidden relative">
            <div className="absolute inset-0 bg-[url('/images/404_error.jpg')] bg-center bg-no-repeat bg-cover bg-fixed"></div>

            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/50 to-slate-900/70"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-500/40 rounded-full animate-ping"></div>
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-red-400/30 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20">

                <div className="mb-12 animate-bounce-slow">
                    <img
                        src="/images/netpong.svg"
                        alt="NETPONG Logo"
                        className="h-16 md:h-20 lg:h-24 w-auto drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                    />
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl px-8 md:px-16 py-12 md:py-16 shadow-2xl border border-white/30 max-w-3xl text-center hover:bg-slate-900/70 hover:shadow-[0_0_60px_rgba(239,68,68,0.4)] hover:border-red-500/50 transition-all duration-500 group">

                    <div className="mb-8">
                        <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 leading-none animate-pulse">
                            404
                        </h1>
                    </div>

                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="w-16 h-1 bg-gradient-to-l from-transparent via-red-500 to-red-500 rounded-full"></div>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
                        Page Not Found
                    </h2>

                    <p className="text-gray-300 text-base md:text-lg lg:text-xl mb-10 leading-relaxed max-w-xl mx-auto">
                        Oops! The page you're looking for seems to have been <span className="text-red-400 font-bold">knocked out of bounds</span>.
                        Let's get you back in the game!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a
                            href="/"
                            className="group/btn relative overflow-hidden bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-4 px-8 md:px-10 font-bold rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] border-2 border-red-500"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover/btn:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="relative z-10">Back to Home</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                        </a>

                        <a
                            href="/contact"
                            className="group/btn relative overflow-hidden bg-slate-800/80 hover:bg-slate-700/80 text-white py-4 px-8 md:px-10 font-bold rounded-2xl shadow-lg transition-all duration-300 inline-flex items-center gap-3 hover:scale-105 border-2 border-white/20 hover:border-white/40"
                        >
                            <span className="relative z-10">Contact Supports</span>
                            <svg className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                        </a>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10">
                        <p className="text-gray-400 text-sm mb-4">Or explore these popular pages:</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <a href="/exclusive" className="text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors duration-300 hover:underline">
                                Exclusive Games
                            </a>
                            <span className="text-gray-600">•</span>
                            <a href="/modes" className="text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors duration-300 hover:underline">
                                Game Modes
                            </a>
                            <span className="text-gray-600">•</span>
                            <a href="/chat" className="text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors duration-300 hover:underline">
                                Start Chat
                            </a>
                        </div>
                    </div>
                </div>

                <p className="text-white/40 text-sm mt-12">
                    Error Code: 404 | NETPONG
                </p>
            </div>

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}