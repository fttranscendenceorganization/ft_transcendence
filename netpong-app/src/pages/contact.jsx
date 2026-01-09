import { useState, useRef, useEffect } from 'react';

export default function Contact() {
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

    const teamMembers = [
        {
            name: 'Ahmed',
            role: 'Frontend Developer',
            initial: 'A',
            bgColor: 'bg-red-700',
            btnHover: 'hover:bg-red-600',
            hoverBorder: 'hover:border-red-700/50'
        },
        {
            name: 'Houdaifa',
            role: 'Backend Developer',
            initial: 'H',
            bgColor: 'bg-orange-500',
            btnHover: 'hover:bg-orange-400',
            hoverBorder: 'hover:border-orange-500/50'
        },
        {
            name: 'Mohammed',
            role: 'Devops',
            initial: 'M',
            bgColor: 'bg-purple-500',
            btnHover: 'hover:bg-purple-400',
            hoverBorder: 'hover:border-purple-500/50'
        },
        {
            name: 'Youssef',
            role: 'Security Developer',
            initial: 'Y',
            bgColor: 'bg-green-500',
            btnHover: 'hover:bg-green-400',
            hoverBorder: 'hover:border-green-500/50'
        }
    ];

    return (
        <div className="antialiased w-full min-h-screen bg-slate-900 text-white">
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <div className="relative w-full min-h-64 md:min-h-96 overflow-hidden bg-[url('/images/beautiful.webp')] bg-no-repeat bg-center bg-cover">
                    <div className="absolute inset-0 bg-slate-900/20"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 py-12 md:py-16">
                        <div className="bg-slate-900/70 backdrop-blur-lg rounded-3xl px-6 md:px-12 py-8 md:py-10 shadow-2xl border border-white/30 max-w-3xl text-center">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 relative inline-block
                                before:content-[''] before:absolute before:-bottom-2 before:left-1/2
                                before:-translate-x-1/2 before:w-24 md:before:w-32 before:h-1 before:bg-red-700
                                before:rounded-full">
                                CONTACT US
                            </h1>
                            <div className="flex items-center justify-center gap-2 my-6">
                                <div className="h-px w-12 bg-white/30"></div>
                                <div className="w-2 h-2 rounded-full bg-red-700"></div>
                                <div className="h-px w-12 bg-white/30"></div>
                            </div>
                            <p className="text-base md:text-lg lg:text-xl text-white font-bold leading-relaxed">
                                <span className="font-extrabold text-red-700 text-xl md:text-2xl">Need Help?</span>
                                <br />
                                <span className="text-gray-200">Feel free to ask or contact us on the following emails below</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Our Team</h2>
                    <p className="text-gray-400">Reach out to the right person for your needs don't be shy</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto justify-center">
                    {teamMembers.map((member) => (
                        <div
                            key={member.name}
                            className={`bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/10 ${member.hoverBorder} transition-all duration-300 hover:scale-105`}
                        >
                            <div className={`w-16 h-16 ${member.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                <span className="text-2xl font-extrabold text-white">{member.initial}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white text-center mb-2">{member.name}</h3>
                            <p className="text-sm text-gray-400 text-center mb-4">{member.role}</p>
                            <a
                                href="#"
                                className={`block ${member.bgColor} ${member.btnHover} text-white text-sm font-bold py-2 px-4 rounded-lg text-center transition duration-150`}
                            >
                                Contact
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}