import { useState, useRef, useEffect } from 'react';

export default function GameModes() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        document.title = "Modes-Netpong";
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const gameModes = [
        {
            name: 'Soul Society',
            url: '/soul-society',
            category: 'Adventure',
            icon: '⚔️',
            gradient: 'from-slate-700 via-slate-600 to-gray-700',
            glowColor: 'rgba(100, 116, 139, 0.5)',
            description: 'Save souls from evil and become the legendary hero. Master air hockey combat to defeat darkness.',
            features: ['Epic Battles', 'Hero Journey', 'Save Souls'],
            accentColor: 'text-gray-300',
            borderColor: 'border-gray-500/30',
            hoverBorder: 'hover:border-gray-400'
        },
        {
            name: 'Zombie Land',
            url: '/zombie-land',
            category: 'Horror',
            icon: '🧟',
            gradient: 'from-green-900 via-green-800 to-emerald-900',
            glowColor: 'rgba(34, 197, 94, 0.5)',
            description: 'Survive the apocalypse where air hockey is your only weapon against the undead hordes.',
            features: ['Survival Mode', 'Undead Hordes', 'Apocalypse'],
            accentColor: 'text-green-300',
            borderColor: 'border-green-500/30',
            hoverBorder: 'hover:border-green-400'
        },
        {
            name: 'Barbie Pink',
            url: '/barbie-pink',
            category: 'Lovely',
            icon: '💖',
            gradient: 'from-pink-600 via-pink-500 to-rose-600',
            glowColor: 'rgba(236, 72, 153, 0.5)',
            description: 'Enter a magical world of friendship and fun. Collect points and play in colorful dream environments.',
            features: ['Dream World', 'Magic & Fun', 'Friendship'],
            accentColor: 'text-pink-200',
            borderColor: 'border-pink-500/30',
            hoverBorder: 'hover:border-pink-400'
        },
        {
            name: 'Joker',
            url: '/joker',
            category: 'Psycho',
            icon: '🃏',
            gradient: 'from-red-900 via-red-800 to-orange-900',
            glowColor: 'rgba(239, 68, 68, 0.5)',
            description: 'Face the ultimate psychopath in a twisted game. Claim the crown and become the new game maker.',
            features: ['Twisted Game', 'Chaos Reigns', 'Crown Awaits'],
            accentColor: 'text-red-300',
            borderColor: 'border-red-500/30',
            hoverBorder: 'hover:border-red-400'
        }
    ];

    return (
        <div className="antialiased bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 w-full min-h-screen text-white overflow-x-hidden relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-[15%] w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-[20%] w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>


            <div className="relative container mx-auto px-4 py-12 md:py-16">
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-block mb-6">
                        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-orange-400 px-6 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider border border-orange-500/30 backdrop-blur-sm shadow-lg">
                            🎮 4 Unique Experiences
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4">
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse">Game Mode</span>
                    </h1>

                    <div className="flex justify-center items-center gap-3 mb-6">
                        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-orange-500 to-orange-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <div className="w-20 h-1 bg-gradient-to-l from-transparent via-orange-500 to-orange-500 rounded-full"></div>
                    </div>

                    <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-2xl mx-auto">
                        Select your adventure and start playing in stunning modern environments</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                    {gameModes.map((mode, index) => (
                        <a
                            key={mode.name}
                            href={mode.url}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`group relative overflow-hidden rounded-3xl p-8 md:p-10 transition-all duration-500 hover:scale-105 border-2 ${mode.borderColor} ${mode.hoverBorder}`}
                            style={{
                                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                                boxShadow: hoveredCard === index ? `0 0 60px ${mode.glowColor}` : '0 10px 40px rgba(0,0,0,0.3)'
                            }}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`}></div>

                            <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px),
                                                 repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)`
                            }}></div>

                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-6xl md:text-7xl transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500">
                                        {mode.icon}
                                    </span>
                                    <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs md:text-sm font-bold border border-white/30">
                                        {mode.category}
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 group-hover:translate-x-2 transition-transform duration-300">
                                    {mode.name}
                                </h2>

                                <p className="text-white/90 text-sm md:text-base mb-6 leading-relaxed">
                                    {mode.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {mode.features.map((feature, i) => (
                                        <span
                                            key={i}
                                            className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/20"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 flex items-center gap-2 border border-white/30 group-hover:scale-105">
                                        <span>Play Now</span>
                                        <svg
                                            className="w-5 h-5 transition-transform group-hover:translate-x-1"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>
                        </a>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <p className="text-gray-400 text-sm md:text-base">
                        Can't decide? <span className="text-orange-400 font-bold">All modes are free to play!</span>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}