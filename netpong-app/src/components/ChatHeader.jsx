import { logout } from '../../utils/api';

export default function ChatHeader({ blockedCount, onClear, onToggleBlocked }) {
    return (
        <header className="w-full bg-slate-900 py-4 relative flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-20 shadow-md gap-4 md:gap-0 border-b border-slate-800">
            <a href="/home" className="flex items-center group">
                <img src="/images/netpong.svg" alt="NETPONG Logo" className="h-8 md:h-10 w-auto transition-transform group-hover:scale-110" />
            </a>
            <div className="flex items-center gap-3">
                <button
                    onClick={onClear}
                    className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base flex items-center gap-2"
                    title="Clear chat history"
                >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span className="hidden sm:inline">Clear Chat</span>
                </button>
                <button
                    onClick={onToggleBlocked}
                    className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base flex items-center gap-2"
                >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span className="hidden sm:inline">Blocked ({blockedCount})</span>
                </button>
                <button
                    onClick={async () => { await logout(); }}
                    className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}