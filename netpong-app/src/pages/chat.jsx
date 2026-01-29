import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChatPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Chat - Netpong";
    }, []);

    const [message, setMessage] = useState('');

    const [blockedUsers, setBlockedUsers] = useState(() => {
        const saved = localStorage.getItem('blockedUsers');
        return saved ? JSON.parse(saved) : [];
    }); // Initialize blockedUsers state

    const [typingUsers, setTypingUsers] = useState([]);

    const [showNotifications, setShowNotifications] = useState(true); // Initialize showNotifications state

    const [notifications, setNotifications] = useState([
        { id: 1, type: 'game_invite', from: 'Ahmed', fromId: '1', game: 'Zombie Land', time: Date.now() - 120000 },
        { id: 2, type: 'tournament', message: 'Barbie Pink Tournament starting in 5 minutes!', time: Date.now() - 60000 }
    ]); // Notification bar informations

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('globalChatMessages');
        return saved ? JSON.parse(saved) : [
            { id: 1, userId: '4', user: 'Youssef', initial: 'Y', time: '2:30 PM', text: 'Welcome to NETPONG chat!', isSent: false, color: 'from-purple-500 to-violet-600', delivered: true, read: true },
            { id: 2, user: 'You', initial: 'Y', time: '2:31 PM', text: 'Hey! Ready to play?', isSent: true, color: 'from-orange-500 to-red-600', delivered: true, read: true },
            { id: 3, userId: '3', user: 'Mohammed', initial: 'M', time: '2:32 PM', text: 'Anyone up for Zombie Land mode?', isSent: false, color: 'from-green-500 to-emerald-600', delivered: true, read: true },
            { id: 4, userId: '2', user: 'Houdaifa', initial: 'H', time: '2:33 PM', text: "I'm in! Let's do this!", isSent: false, color: 'from-pink-500 to-rose-600', delivered: true, read: true }
        ];
    }); // Default messages showed in the first re-render ever

    const [showSidebar, setShowSidebar] = useState(false);

    const [showBlockedList, setShowBlockedList] = useState(false);

    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const messagesEndRef = useRef(null);

    const typingTimeoutRef = useRef({});

    const onlinePlayers = [
        { id: '1', name: 'Ahmed', initial: 'A', game: 'Zombie Land', color: 'from-orange-500 to-red-600' },
        { id: '2', name: 'Houdaifa', initial: 'H', game: 'Barbie Pink', color: 'from-purple-500 to-violet-600' },
        { id: '3', name: 'Mohammed', initial: 'M', game: 'Saul Society', color: 'from-green-500 to-emerald-600' },
        { id: '4', name: 'Youssef', initial: 'Y', game: 'Joker', color: 'from-pink-500 to-rose-600' }
    ].filter(player => !blockedUsers.includes(player.id)); // onlien players excluded from the blocked users

    const liveMatches = [
        { type: 'live', title: 'Final Game', description: 'Ahmed vs Mohammed - Zombie Land', badge: 'LIVE NOW', badgeColor: 'green' },
        { type: 'recent', title: 'Recent Match', description: 'Houdaifa wins Barbie Pink tournament', badge: 'Winner Chicken Dinner !!', badgeColor: 'orange' },
        { type: 'top', title: 'Top Player', description: 'Youssef - 10 wins streak', badge: 'MVP', badgeColor: 'yellow' }
    ];

    useEffect(() => {
        localStorage.setItem('globalChatMessages', JSON.stringify(messages));
    }, [messages]); // Persist messages to localStorage whenever they change

    useEffect(() => {
        localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
    }, [blockedUsers]); // Persist blockedUsers to localStorage whenever they change

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.95 && typingUsers.length === 0) {
                const randomPlayer = onlinePlayers[Math.floor(Math.random() * onlinePlayers.length)];
                setTypingUsers([randomPlayer.name]);

                setTimeout(() => {
                    setTypingUsers([]);
                }, 3000);
            }
        }, 5000); // Check for typing users every 5 seconds

        return () => clearInterval(interval); // cleanup
    }, [onlinePlayers.length]);

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
                color: 'from-orange-500 to-red-600',
                delivered: true,
                read: false
            };
            setMessages([...messages, newMessage]);
            setMessage('');
            setTimeout(() => {
                setMessages(prev => prev.map(msg =>
                    msg.id === newMessage.id ? { ...msg, read: true } : msg
                ));
            }, 2000);
        }
    }; // Handle sending message    

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    }; // Handle key press for sending message

    const handlePlayerClick = (playerId) => {
        navigate(`/messages/${playerId}`);
    };

    const handleMessageUserClick = (userId) => {
        if (userId && !blockedUsers.includes(userId)) {
            navigate(`/messages/${userId}`);
        }
    };

    const handleBlockUser = (userId) => {
        if (!blockedUsers.includes(userId)) {
            setBlockedUsers([...blockedUsers, userId]);
            setMessages(prev => prev.filter(msg => msg.userId !== userId));
        }
    }; // Handle blocking user

    const handleUnblockUser = (userId) => {
        setBlockedUsers(prev => prev.filter(id => id !== userId));
    }; // Handle unblocking user

    const handleClearMessages = () => {
        setMessages([]);
        localStorage.removeItem('globalChatMessages');
        setShowClearConfirm(false);
    }; // Handle clearing messages

    const handleAcceptGameInvite = (notification) => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        alert(`Joining ${notification.game} game with ${notification.from}!`);
    }; // Handle accepting game invite

    const handleDeclineGameInvite = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }; // Handle declining game invite

    const dismissNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }; // Handle dismissing notification

    const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }; // Format time ago

    const filteredMessages = messages.filter(msg => !blockedUsers.includes(msg.userId)); // filter out blocked users

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
            <header className="w-full bg-slate-900 py-4 relative flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-20 shadow-md gap-4 md:gap-0 border-b border-slate-800">
                <a href="/" className="flex items-center group">
                    <img src="/images/netpong.svg" alt="NETPONG Logo" className="h-8 md:h-10 w-auto transition-transform group-hover:scale-110" />
                </a>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base flex items-center gap-2"
                        title="Clear chat history"
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        <span className="hidden sm:inline">Clear Chat</span>
                    </button>
                    <button
                        onClick={() => setShowBlockedList(!showBlockedList)}
                        className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span className="hidden sm:inline">Blocked ({blockedUsers.length})</span>
                    </button>
                    <a href="/logout" className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base">
                        SIGN OUT
                    </a>
                </div>
            </header>

            {showNotifications && notifications.length > 0 && (
                <div className="bg-gradient-to-r from-purple-900/90 to-violet-900/90 border-b border-purple-700 px-4 py-2">
                    <div className="max-w-6xl mx-auto">
                        {notifications.map(notif => (
                            <div key={notif.id} className="flex items-center justify-between py-2">
                                {notif.type === 'game_invite' ? (
                                    <>
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-sm">
                                                    {notif.from} invited you to play {notif.game}!
                                                </p>
                                                <p className="text-purple-200 text-xs">{formatTimeAgo(notif.time)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAcceptGameInvite(notif)}
                                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleDeclineGameInvite(notif.id)}
                                                className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-sm">{notif.message}</p>
                                                <p className="text-purple-200 text-xs">{formatTimeAgo(notif.time)}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => dismissNotification(notif.id)}
                                            className="text-purple-200 hover:text-white p-2"
                                        >
                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showBlockedList && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowBlockedList(false)}>
                    <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-bold text-xl">Blocked Users</h2>
                            <button onClick={() => setShowBlockedList(false)} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {blockedUsers.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No blocked users</p>
                        ) : (
                            <div className="space-y-2">
                                {blockedUsers.map(userId => {
                                    const allPlayers = [
                                        { id: '1', name: 'Ahmed', initial: 'A', color: 'from-orange-500 to-red-600' },
                                        { id: '2', name: 'Houdaifa', initial: 'H', color: 'from-purple-500 to-violet-600' },
                                        { id: '3', name: 'Mohammed', initial: 'M', color: 'from-green-500 to-emerald-600' },
                                        { id: '4', name: 'Youssef', initial: 'Y', color: 'from-pink-500 to-rose-600' }
                                    ];
                                    const user = allPlayers.find(p => p.id === userId);
                                    if (!user) return null;

                                    return (
                                        <div key={userId} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 bg-gradient-to-br ${user.color} rounded-full flex items-center justify-center font-bold text-white`}>
                                                    {user.initial}
                                                </div>
                                                <span className="text-white font-bold">{user.name}</span>
                                            </div>
                                            <button
                                                onClick={() => handleUnblockUser(userId)}
                                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                                            >
                                                Unblock
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showClearConfirm && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowClearConfirm(false)}>
                    <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-xl">Clear Chat History?</h2>
                                <p className="text-gray-400 text-sm">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6">
                            All messages in the global chat will be permanently deleted from your device. This will not affect other users' chat history.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-4 rounded-lg font-bold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearMessages}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            {onlinePlayers.map((player) => (
                                <div
                                    key={player.id}
                                    className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 transition group"
                                >
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
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handlePlayerClick(player.id)}
                                                className="p-1.5 hover:bg-slate-600 rounded-lg transition"
                                                title="Message"
                                            >
                                                <svg className="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleBlockUser(player.id)}
                                                className="p-1.5 hover:bg-slate-600 rounded-lg transition"
                                                title="Block User"
                                            >
                                                <svg className="w-4 h-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                            </button>
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
                        {filteredMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                                    </svg>
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">No messages yet</h3>
                                <p className="text-gray-400 text-sm max-w-xs">
                                    Start chatting with other players in the global chat!
                                </p>
                            </div>
                        ) : (
                            <>
                                {filteredMessages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'} items-start gap-3`}>
                                        {!msg.isSent && (
                                            <div
                                                onClick={() => handleMessageUserClick(msg.userId)}
                                                className={`w-8 h-8 bg-gradient-to-br ${msg.color} rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0 cursor-pointer hover:scale-110 transition-transform`}
                                                title={`Click to message ${msg.user}`}
                                            >
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
                                                        <span
                                                            onClick={() => handleMessageUserClick(msg.userId)}
                                                            className="text-white font-bold text-sm hover:text-purple-400 cursor-pointer transition-colors"
                                                            title={`Click to message ${msg.user}`}
                                                        >
                                                            {msg.user}
                                                        </span>
                                                        <span className="text-gray-500 text-xs">{msg.time}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className={`${msg.isSent ? 'bg-gradient-to-r from-orange-600 to-red-600 rounded-tr-none' : 'bg-slate-700 rounded-tl-none'} text-white rounded-2xl px-4 py-2 max-w-xs md:max-w-md shadow-lg`}>
                                                <p className="text-sm">{msg.text}</p>
                                            </div>
                                            {msg.isSent && (
                                                <div className="flex items-center gap-1 px-2">
                                                    {msg.read ? (
                                                        <svg className="w-4 h-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                                                            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                                                        </svg>
                                                    ) : msg.delivered ? (
                                                        <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {msg.isSent && (
                                            <div className={`w-8 h-8 bg-gradient-to-br ${msg.color} rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                                                {msg.initial}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {typingUsers.length > 0 && (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm italic animate-pulse">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                        <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                                    </div>
                                )}
                            </>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bg-slate-800 border-t border-slate-700 p-3 md:p-4">
                        <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
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