import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function JokerHeader() {
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

    return (
        <header className="w-full bg-slate-900/95 backdrop-blur-sm py-4 relative flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-20 shadow-md gap-4 md:gap-0">
            <Link to="/" className="flex items-center">
                <img src="/images/joker.svg" alt="NETPONG Logo" className="h-8 md:h-10 w-auto" />
            </Link>

            <nav className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm md:text-base">
                <Link to="/" className="text-white font-bold hover:text-red-500 transition">
                    Home
                </Link>
                <Link to="/exclusive" className="text-white font-bold hover:text-red-500 transition">
                    Exclusive
                </Link>

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                        className="text-white font-bold hover:text-red-500 cursor-pointer transition"
                    >
                        Game Modes ▼
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute bg-slate-800 text-white mt-2 w-40 rounded-lg shadow-lg left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-30 flex flex-col">
                            <Link to="/saul-society" className="px-4 py-2 hover:bg-gray-400 hover:text-black transition">
                                Saul Society
                            </Link>
                            <Link to="/barbie-pink" className="px-4 py-2 hover:bg-pink-400 hover:text-black transition">
                                Pink Barbie
                            </Link>
                            <Link to="/zombie-land" className="px-4 py-2 hover:bg-green-800 hover:text-black transition">
                                Zombie Land
                            </Link>
                            <Link to="/joker" className="px-4 py-2 hover:bg-red-900 hover:text-black transition">
                                Joker
                            </Link>
                        </div>
                    )}
                </div>

                <Link to="/contact" className="text-white font-bold hover:text-red-500 transition">
                    Contact
                </Link>
            </nav>

            <Link to="/chat" className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base">
                START CHAT
            </Link>
        </header>
    );
}