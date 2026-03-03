import { Link } from 'react-router-dom';

export default function LoginHeader() {

    return (
        <header className="sticky top-0 w-full bg-slate-900/95 backdrop-blur-md py-4 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-50 shadow-lg border-b border-white/10 gap-4 md:gap-0">
            <Link to="/" className="flex items-center group">
                <img
                    src="/images/login.svg"
                    alt="NETPONG Logo"
                    className="h-8 md:h-10 w-auto transition-transform group-hover:scale-110" />
            </Link>

            <nav className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm md:text-base">
                <Link to="/" className="text-white font-bold hover:text-violet-400 transition-all duration-300 relative group">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>

                <Link to="/first-contact" className="text-white font-bold hover:text-violet-400 transition-all duration-300 relative group">
                    Contact
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </nav>

            <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 px-6 md:px-8 py-2.5 rounded-full border border-purple-500/40 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-200 to-purple-400 tracking-wide uppercase">
                    Always For You
                </span>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

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