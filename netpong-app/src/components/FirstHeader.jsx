
export default function FirstHeader() {

    return (
        <header className="sticky top-0 w-full bg-slate-900/95 backdrop-blur-md py-4 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-50 shadow-lg border-b border-white/10 gap-4 md:gap-0">
            <Link to="/" className="flex items-center group">
                <img
                    src="/images/netpong.svg"
                    alt="NETPONG Logo"
                    className="h-8 md:h-10 w-auto transition-transform group-hover:scale-110"
                />
            </Link>

            <nav className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm md:text-base">
                <Link to="/" className="text-white font-bold hover:text-orange-400 transition-all duration-300 relative group">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>

                <Link to="/first-contact" className="text-white font-bold hover:text-orange-400 transition-all duration-300 relative group">
                    Contact
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </nav>

            <Link
                to="/signup"
                className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-2 px-4 md:px-6 font-bold rounded-xl shadow-lg transition-all duration-300 text-sm md:text-base hover:scale-105 hover:shadow-red-500/50 group/btn"
            >
                <span className="relative z-10">JOIN NOW</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
            </Link>

        </header>
    );
}