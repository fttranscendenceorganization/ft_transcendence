import { useState, useEffect, useRef } from 'react';

export default function ChatPage() {
    useEffect(() => {
        document.title = "Chat - Netpong";
    }, []);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, user: 'Youssef', initial: 'Y', time: '2:30 PM', text: 'Welcome to NETPONG chat!', isSent: false, color: 'from-purple-500 to-violet-600' },
        { id: 2, user: 'You', initial: 'Y', time: '2:31 PM', text: 'Hey! Ready to play?', isSent: true, color: 'from-orange-500 to-red-600' },
        { id: 3, user: 'Mohammed', initial: 'M', time: '2:32 PM', text: 'Anyone up for Zombie Land mode?', isSent: false, color: 'from-green-500 to-emerald-600' },
        { id: 4, user: 'Houdaifa', initial: 'H', time: '2:33 PM', text: "I'm in! Let's do this!", isSent: false, color: 'from-pink-500 to-rose-600' }
    ]);
    const [showSidebar, setShowSidebar] = useState(false);
    const messagesEndRef = useRef(null);

    const onlinePlayers = [
        { name: 'Ahmed', initial: 'A', game: 'Zombie Land', color: 'from-orange-500 to-red-600' },
        { name: 'Houdaifa', initial: 'H', game: 'Barbie Pink', color: 'from-purple-500 to-violet-600' },
        { name: 'Mohammed', initial: 'M', game: 'Saul Society', color: 'from-green-500 to-emerald-600' },
        { name: 'Youssef', initial: 'Y', game: 'Joker', color: 'from-pink-500 to-rose-600' }
    ];

    const liveMatches = [
        { type: 'live', title: 'Final Game', description: 'Ahmed vs Mohammed - Zombie Land', badge: 'LIVE NOW', badgeColor: 'green' },
        { type: 'recent', title: 'Recent Match', description: 'Houdaifa wins Barbie Pink tournament', badge: 'Winner Chicken Dinner !!', badgeColor: 'orange' },
        { type: 'top', title: 'Top Player', description: 'Youssef - 10 wins streak', badge: 'MVP', badgeColor: 'yellow' }
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            const newMessage = {
                id: messages.length + 1,
                user: 'You',
                initial: 'Y',
                time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                text: message,
                isSent: true,
                color: 'from-orange-500 to-red-600'
            };
            setMessages([...messages, newMessage]);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
            <header className="w-full bg-slate-900 py-4 relative flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-20 shadow-md gap-4 md:gap-0 border-b border-slate-800">
                <a href="/" className="flex items-center group">
                    <img src="/images/netpong.svg" alt="NETPONG Logo" className="h-8 md:h-10 w-auto transition-transform group-hover:scale-110" />
                </a>
                <a href="/logout" className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base">
                    SIGN OUT
                </a>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className={`${showSidebar ? 'fixed inset-0 z-40' : 'hidden'} lg:flex lg:relative lg:w-64 bg-slate-800 border-r border-slate-700 flex-col`}>
                    {showSidebar && (
                        <div className="lg:hidden absolute inset-0 bg-black/50" onClick={() => setShowSidebar(false)}></div>
                    )}

                    <div className={`${showSidebar ? 'relative z-50 w-64' : 'w-full'} bg-slate-800 h-full flex flex-col`}>
                        <div className="p-4 border-b border-slate-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-white font-bold text-lg mb-2">Online Players</h2>
                                    <p className="text-gray-400 text-sm">{onlinePlayers.length} players online</p>
                                </div>
                                {showSidebar && (
                                    <button onClick={() => setShowSidebar(false)} className="lg:hidden text-white">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {onlinePlayers.map((player, index) => (
                                <div key={index} className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 cursor-pointer transition group">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className={`w-10 h-10 bg-gradient-to-br ${player.color} rounded-full flex items-center justify-center font-bold text-white`}>
                                                {player.initial}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-bold text-sm">{player.name}</p>
                                            <p className="text-gray-400 text-xs">{player.game}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-700">
                            <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 px-4 rounded-lg font-bold transition text-sm">
                                Find Match
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-slate-900">
                    <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center font-bold text-white">
                                G
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">Global Chat</p>
                                <p className="text-gray-400 text-xs">{onlinePlayers.length} members online</p>
                            </div>
                        </div>
                        <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden text-white">
                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'} items-start gap-3`}>
                                {!msg.isSent && (
                                    <div className={`w-8 h-8 bg-gradient-to-br ${msg.color} rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                                        {msg.initial}
                                    </div>
                                )}

                                <div className={`flex flex-col gap-1 ${msg.isSent ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2">
                                        {msg.isSent ? (
                                            <>
                                                <span className="text-gray-500 text-xs">{msg.time}</span>
                                                <span className="text-white font-bold text-sm">{msg.user}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-white font-bold text-sm">{msg.user}</span>
                                                <span className="text-gray-500 text-xs">{msg.time}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className={`${msg.isSent ? 'bg-gradient-to-r from-orange-600 to-red-600 rounded-tr-none' : 'bg-slate-700 rounded-tl-none'} text-white rounded-2xl px-4 py-2 max-w-xs md:max-w-md shadow-lg`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>

                                {msg.isSent && (
                                    <div className={`w-8 h-8 bg-gradient-to-br ${msg.color} rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                                        {msg.initial}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bg-slate-800 border-t border-slate-700 p-3 md:p-4">
                        <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 md:py-3 border-2 border-slate-600 focus:outline-none focus:border-orange-500 transition text-sm md:text-base"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold shadow-lg transition duration-150 text-sm md:text-base flex items-center gap-2"
                            >
                                <span>Send</span>
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>

                <div className="hidden xl:flex xl:w-80 bg-slate-800 border-l border-slate-700 flex-col">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-white font-bold text-lg">Live Matches</h2>
                    </div>

                    <div className="relative h-48 bg-slate-900">
                        <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
                            <source src="/images/small.mp4" type="video/mp4" />
                        </video>
                    </div>

                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-white font-bold text-sm mb-2">Tournament Highlights</h3>
                        <p className="text-gray-400 text-xs">Watch the best moments from recent matches</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {liveMatches.map((match, index) => (
                            <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                                {match.type === 'live' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-white font-bold text-xs">{match.badge}</span>
                                    </div>
                                )}
                                <p className="text-gray-300 text-sm font-bold mb-1">{match.title}</p>
                                <p className="text-gray-400 text-xs mb-2">{match.description}</p>
                                {match.type !== 'live' && (
                                    <div className="flex items-center gap-2">
                                        <span className={`text-${match.badgeColor}-400 text-xs`}>{match.badge}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}