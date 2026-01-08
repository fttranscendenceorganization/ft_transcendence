import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function ZombieLandHeader() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const gameModesData = [
        {
            name: 'Saul Society',
            path: '/saul-society',
            icon: '⚔️',
            color: 'gray',
            hoverBg: 'hover:bg-gray-400',
            description: 'Saul Protector'
        }
        ,
        {
            name: 'Pink Barbie',
            path: '/barbie-pink',
            icon: '💖',
            color: 'pink',
            hoverBg: 'hover:bg-pink-400',
            description: 'Dream world'
        },
        {
            name: 'Zombie Land',
            path: '/zombie-land',
            icon: '🧟',
            color: 'green',
            hoverBg: 'hover:bg-green-600',
            description: 'Survival mode'
        },
        {
            name: 'Joker',
            path: '/joker',
            icon: '🃏',
            color: 'red',
            hoverBg: 'hover:bg-red-700',
            description: 'Minde Hunter'
        }
    ];

    return (
        <header className="sticky top-0 w-full bg-slate-900/95 backdrop-blur-md py-4 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-50 shadow-lg border-b border-white/10 gap-4 md:gap-0">
            <Link to="/" className="flex items-center group">
                <img
                    src="/images/zombie.svg"
                    alt="NETPONG Logo"
                    className="h-8 md:h-10 w-auto transition-transform group-hover:scale-110" />
            </Link>

            <nav className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm md:text-base">
                <Link to="/" className="text-white font-bold hover:text-green-400 transition-all duration-300 relative group">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/exclusive" className="text-white font-bold hover:text-green-400 transition-all duration-300 relative group">
                    Exclusive
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="text-white font-bold hover:text-green-400 cursor-pointer transition-all duration-300 flex items-center gap-2 relative group"
                    >
                        Game Modes
                        <svg
                            className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
                    </button>

                    <div
                        className={`absolute bg-slate-800/95 backdrop-blur-xl border border-white/20 mt-3 w-64 rounded-2xl shadow-2xl left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-30 overflow-hidden transition-all duration-300 ${isDropdownOpen
                            ? 'opacity-100 visible translate-y-0'
                            : 'opacity-0 invisible -translate-y-2'
                            }`}
                    >

                        <div className="bg-gradient-to-r from-green-500/20 to-red-500/20 px-4 py-3 border-b border-white/10">
                            <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Choose Your Mode</p>
                        </div>

                        <div className="p-2">
                            {gameModesData.map((mode, index) => (
                                <a
                                    key={mode.path}
                                    href={mode.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${mode.hoverBg} hover:text-black transition-all duration-300 group/item relative overflow-hidden`}
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                        animation: isDropdownOpen ? 'slideIn 0.3s ease-out forwards' : 'none'
                                    }}
                                >
                                    <span className="text-2xl transition-transform group-hover/item:scale-125 group-hover/item:rotate-12">
                                        {mode.icon}
                                    </span>

                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{mode.name}</div>
                                        <div className="text-xs opacity-70">{mode.description}</div>
                                    </div>

                                    <svg
                                        className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover/item:opacity-100 group-hover/item:translate-x-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>

                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-700"></div>
                                </a>
                            ))}
                        </div>

                        <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 px-4 py-2 border-t border-white/10">
                            <p className="text-xs text-center text-green-400">4 Unique Experiences</p>
                        </div>
                    </div>

                </div>

                <Link to="/contact" className="text-white font-bold hover:text-green-400 transition-all duration-300 relative group">
                    Contact
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </nav>

            <Link
                to="/chat"
                className="relative overflow-hidden bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition-all duration-300 text-sm md:text-base hover:scale-105 hover:shadow-green-500/50 group/btn">
                <span className="relative z-10">START CHAT</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
            </Link>

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </header>
    );
}