import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function PrivateMessagePage() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState('');
    const [showSidebar, setShowSidebar] = useState(false);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [showGameInvite, setShowGameInvite] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const messagesEndRef = useRef(null);

    const currentChat = {
        id: userId || '1',
        name: 'Ahmed',
        initial: 'A',
        status: 'online',
        color: 'from-orange-500 to-red-600',
        lastSeen: 'Active now',
        stats: { games: 128, wins: 87, winRate: 63 }
    };

    useEffect(() => {
        document.title = `Chat with ${currentChat?.name || 'User'} - Netpong`;
        const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
        setIsBlocked(blockedUsers.includes(userId));
    }, [userId, currentChat.name]);

    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(`chat_${userId}`);
        return saved ? JSON.parse(saved) : [
            { id: 1, user: 'Ahmed', initial: 'A', time: '2:30 PM', text: 'Hey! Want to play a match?', isSent: false, color: 'from-orange-500 to-red-600', seen: true },
            { id: 2, user: 'You', initial: 'Y', time: '2:31 PM', text: 'Sure! What mode?', isSent: true, color: 'from-purple-500 to-violet-600', seen: true },
            { id: 3, user: 'Ahmed', initial: 'A', time: '2:32 PM', text: 'How about Zombie Land?', isSent: false, color: 'from-orange-500 to-red-600', seen: true },
            { id: 4, user: 'You', initial: 'Y', time: '2:33 PM', text: "Perfect! Let's do it", isSent: true, color: 'from-purple-500 to-violet-600', seen: false }
        ];
    });

    const [recentChats] = useState([
        { id: '1', name: 'Ahmed', initial: 'A', lastMessage: 'See you in the game!', time: '2:33 PM', unread: 2, status: 'online', color: 'from-orange-500 to-red-600' },
        { id: '2', name: 'Houdaifa', initial: 'H', lastMessage: 'GG! That was a good game', time: '1:45 PM', unread: 0, status: 'online', color: 'from-purple-500 to-violet-600' },
        { id: '3', name: 'Mohammed', initial: 'M', lastMessage: 'Thanks for the play!', time: '12:20 PM', unread: 0, status: 'away', color: 'from-green-500 to-emerald-600' },
        { id: '4', name: 'Youssef', initial: 'Y', lastMessage: 'Want to play with me?', time: 'Yesterday', unread: 1, status: 'offline', color: 'from-pink-500 to-rose-600' }
    ]);

    const gameModesAvailable = [
        { id: 1, name: 'Zombie Land', icon: '🧟', description: 'Survive the zombie apocalypse' },
        { id: 2, name: 'Barbie Pink', icon: '💖', description: 'Cute and colorful gameplay' },
        { id: 3, name: 'Soul Society', icon: '⚔️', description: 'Legal battle royale' },
        { id: 4, name: 'Joker', icon: '🃏', description: 'Chaotic wild card mode' }
    ];

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`chat_${userId}`, JSON.stringify(messages));
        }
    }, [messages, userId]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.97 && !isTyping) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [isTyping]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && !isBlocked) {
            const newMessage = {
                id: messages.length + 1,
                user: 'You',
                initial: 'Y',
                time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                text: message,
                isSent: true,
                color: 'from-purple-500 to-violet-600',
                seen: false
            };
            setMessages([...messages, newMessage]);
            setMessage('');

            setTimeout(() => {
                setMessages(prev => prev.map(msg =>
                    msg.id === newMessage.id ? { ...msg, seen: true } : msg
                ));
            }, 2000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    };

    const selectChat = (chatId) => {
        navigate(`/messages/${chatId}`);
        setShowSidebar(false);
    };

    const getStatusColor = (status) => {
        const colors = { online: 'bg-green-500', away: 'bg-yellow-500', offline: 'bg-gray-500' };
        return colors[status] || 'bg-gray-500';
    };

    const handleBlockUser = () => {
        const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
        if (!blockedUsers.includes(userId)) {
            blockedUsers.push(userId);
            localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
            setIsBlocked(true);
        }
        setShowBlockConfirm(false);
    };

    const handleUnblockUser = () => {
        const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
        const updated = blockedUsers.filter(id => id !== userId);
        localStorage.setItem('blockedUsers', JSON.stringify(updated));
        setIsBlocked(false);
    };

    const handleSendGameInvite = (gameMode) => {
        const inviteMessage = {
            id: messages.length + 1,
            user: 'You',
            initial: 'Y',
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            text: `Game Invitation: ${gameMode.name} - ${gameMode.description}`,
            isSent: true,
            color: 'from-purple-500 to-violet-600',
            seen: false,
            isGameInvite: true
        };
        setMessages([...messages, inviteMessage]);
        setShowGameInvite(false);

        setTimeout(() => {
            setMessages(prev => prev.map(msg =>
                msg.id === inviteMessage.id ? { ...msg, seen: true } : msg
            ));
        }, 2000);
    };

    const handleClearMessages = () => {
        setMessages([]);
        localStorage.removeItem(`chat_${userId}`);
        setShowClearConfirm(false);
    };

    const MessageStatus = ({ seen }) => {
        if (seen) {
            return (
                <svg className="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.41 13.41L6 19l1.41-1.42L1.83 12m20.41-6.42L11.66 16.17L7.5 12l-1.43 1.41L11.66 19l12-12M18 7l-1.41-1.42-6.35 6.35 1.42 1.41L18 7z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
            );
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
            <header className="w-full bg-slate-900 py-4 relative flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-20 shadow-md gap-4 md:gap-0 border-b border-slate-800">
                <a href="/" className="flex items-center group">
                    <img src="/images/netpong.svg" alt="NETPONG Logo" className="h-8 md:h-10 w-auto transition-transform group-hover:scale-110" />
                </a>
                <div className="flex items-center gap-3">
                    <a href="/chat" className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base">
                        GLOBAL CHAT
                    </a>
                    <a href="/home" className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base">
                        DASHBOARD
                    </a>
                </div>
            </header>

            <ModalConfirm
                show={showBlockConfirm}
                onClose={() => setShowBlockConfirm(false)}
                onConfirm={handleBlockUser}
                title={`Block ${currentChat.name}?`}
                message="You won't be able to send or receive messages from this user. They won't be notified that you've blocked them."
                confirmText="Block User"
                confirmClass="bg-red-600 hover:bg-red-500"
            />

            <ModalGameInvite
                show={showGameInvite}
                onClose={() => setShowGameInvite(false)}
                userName={currentChat.name}
                gameModes={gameModesAvailable}
                onInvite={handleSendGameInvite}
            />

            <ModalConfirm
                show={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClearMessages}
                title="Clear Chat History?"
                message={`All messages in this conversation with ${currentChat.name} will be permanently deleted from your device.`}
                confirmText="Clear All"
                confirmClass="bg-red-600 hover:bg-red-500"
                icon={
                    <svg className="w-6 h-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                }
            />

            {isBlocked && (
                <div className="bg-red-900/90 border-b border-red-700 px-4 py-3">
                    <div className="flex items-center justify-between max-w-6xl mx-auto">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <p className="text-white font-bold text-sm">You have blocked {currentChat.name}</p>
                        </div>
                        <button onClick={handleUnblockUser} className="bg-red-700 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm transition">
                            Unblock
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden">
                <ConversationsSidebar
                    show={showSidebar}
                    onClose={() => setShowSidebar(false)}
                    currentChatId={currentChat.id}
                    chats={recentChats}
                    onSelectChat={selectChat}
                    getStatusColor={getStatusColor}
                />

                <div className="flex-1 flex flex-col bg-slate-900">
                    <ChatHeader
                        currentChat={currentChat}
                        isBlocked={isBlocked}
                        onToggleSidebar={() => setShowSidebar(!showSidebar)}
                        onToggleProfile={() => setShowProfilePanel(!showProfilePanel)}
                        onClearChat={() => setShowClearConfirm(true)}
                        onGameInvite={() => setShowGameInvite(true)}
                        onBlock={() => setShowBlockConfirm(true)}
                        onUnblock={handleUnblockUser}
                        getStatusColor={getStatusColor}
                    />

                    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-800">
                        <div className="p-4 min-h-full flex flex-col">
                            <div className="flex items-center justify-center my-6">
                                <div className="bg-slate-700/50 text-gray-400 text-xs px-4 py-1.5 rounded-full">Today</div>
                            </div>

                            <div className="space-y-4 flex-1">
                                {messages.length === 0 ? (
                                    <EmptyMessages userName={currentChat.name} />
                                ) : (
                                    <>
                                        {messages.map((msg) => (
                                            <MessageBubble key={msg.id} message={msg} MessageStatus={MessageStatus} />
                                        ))}
                                        {isTyping && <TypingIndicator chat={currentChat} />}
                                    </>
                                )}
                            </div>
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <MessageInput
                        message={message}
                        setMessage={setMessage}
                        onSend={handleSendMessage}
                        onKeyPress={handleKeyPress}
                        isBlocked={isBlocked}
                        onUnblock={handleUnblockUser}
                    />
                </div>

                <ProfilePanel
                    show={showProfilePanel}
                    onClose={() => setShowProfilePanel(false)}
                    currentChat={currentChat}
                    isBlocked={isBlocked}
                    onUnblock={handleUnblockUser}
                    getStatusColor={getStatusColor}
                />
            </div>
        </div>
    );
}

function ModalConfirm({ show, onClose, onConfirm, title, message, confirmText, confirmClass, icon }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {icon && (
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">{icon}</div>
                        <div>
                            <h2 className="text-white font-bold text-xl">{title}</h2>
                            <p className="text-gray-400 text-sm">This action cannot be undone</p>
                        </div>
                    </div>
                )}
                {!icon && <h2 className="text-white font-bold text-xl mb-4">{title}</h2>}
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-4 rounded-lg font-bold transition">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`flex-1 text-white py-2.5 px-4 rounded-lg font-bold transition ${confirmClass}`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalGameInvite({ show, onClose, userName, gameModes, onInvite }) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-xl">Invite to Play</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-gray-300 mb-6">Choose a game mode to invite {userName}</p>
                <div className="space-y-2">
                    {gameModes.map(game => (
                        <button key={game.id} onClick={() => onInvite(game)} className="w-full bg-slate-700/50 hover:bg-slate-700 text-left rounded-lg p-4 transition group">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{game.icon}</span>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm">{game.name}</p>
                                    <p className="text-gray-400 text-xs">{game.description}</p>
                                </div>
                                <svg className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ConversationsSidebar({ show, onClose, currentChatId, chats, onSelectChat, getStatusColor }) {
    return (
        <div className={`${show ? 'fixed inset-0 z-40' : 'hidden'} lg:flex lg:relative lg:w-80 bg-slate-800 border-r border-slate-700 flex-col`}>
            {show && <div className="lg:hidden absolute inset-0 bg-black/50" onClick={onClose}></div>}
            <div className={`${show ? 'relative z-50 w-80' : 'w-full'} bg-slate-800 h-full flex flex-col`}>
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white font-bold text-lg">Messages</h2>
                        {show && (
                            <button onClick={onClose} className="lg:hidden text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Search messages..." className="w-full bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 pl-10 border-2 border-slate-600 focus:outline-none focus:border-purple-500 transition text-sm" />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map((chat) => (
                        <div key={chat.id} onClick={() => onSelectChat(chat.id)} className={`p-4 cursor-pointer transition hover:bg-slate-700/50 border-b border-slate-700/50 ${chat.id === currentChatId ? 'bg-slate-700/70' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${chat.color} rounded-full flex items-center justify-center font-bold text-white`}>{chat.initial}</div>
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getStatusColor(chat.status)} border-2 border-slate-800 rounded-full`}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-white font-bold text-sm truncate">{chat.name}</p>
                                        <span className="text-gray-400 text-xs flex-shrink-0">{chat.time}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-400 text-xs truncate">{chat.lastMessage}</p>
                                        {chat.unread > 0 && (
                                            <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">{chat.unread}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-700">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white py-2.5 px-4 rounded-lg font-bold transition text-sm flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Message
                    </button>
                </div>
            </div>
        </div>
    );
}

function ChatHeader({ currentChat, isBlocked, onToggleSidebar, onToggleProfile, onClearChat, onGameInvite, onBlock, onUnblock, getStatusColor }) {
    return (
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={onToggleSidebar} className="lg:hidden text-white mr-2">
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
                <div className="relative cursor-pointer" onClick={onToggleProfile}>
                    <div className={`w-11 h-11 bg-gradient-to-br ${currentChat.color} rounded-full flex items-center justify-center font-bold text-white hover:scale-105 transition-transform`}>
                        {currentChat.initial}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getStatusColor(currentChat.status)} border-2 border-slate-800 rounded-full`}></div>
                </div>
                <div>
                    <p className="text-white font-bold text-sm">{currentChat.name}</p>
                    <p className="text-gray-400 text-xs">{currentChat.status === 'online' ? currentChat.lastSeen : 'Offline'}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onClearChat} className="p-2 hover:bg-slate-700 rounded-lg transition text-gray-400 hover:text-white" title="Clear chat history">
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
                <button onClick={onGameInvite} className="p-2 hover:bg-slate-700 rounded-lg transition text-purple-400" title="Invite to game" disabled={isBlocked}>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                </button>
                {!isBlocked ? (
                    <button onClick={onBlock} className="p-2 hover:bg-slate-700 rounded-lg transition text-red-400" title="Block user">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </button>
                ) : (
                    <button onClick={onUnblock} className="p-2 hover:bg-slate-700 rounded-lg transition text-green-400" title="Unblock user">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

function MessageBubble({ message, MessageStatus }) {
    return (
        <div className={`flex ${message.isSent ? 'justify-end' : 'justify-start'} items-start gap-3`}>
            {!message.isSent && (
                <div className={`w-8 h-8 bg-gradient-to-br ${message.color} rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                    {message.initial}
                </div>
            )}
            <div className={`flex flex-col gap-1 ${message.isSent ? 'items-end' : 'items-start'}`}>
                <div className={`${message.isSent ? 'bg-gradient-to-r from-purple-600 to-violet-600 rounded-tr-none' : 'bg-slate-700 rounded-tl-none'} text-white rounded-2xl px-4 py-2.5 max-w-xs md:max-w-md shadow-lg ${message.isGameInvite ? 'border-2 border-yellow-500/50' : ''}`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                <div className="flex items-center gap-2 px-2">
                    <span className="text-gray-500 text-xs">{message.time}</span>
                    {message.isSent && <MessageStatus seen={message.seen} />}
                </div>
            </div>
            {message.isSent && (
                <div className={`w-8 h-8 bg-gradient-to-br ${message.color} rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                    {message.initial}
                </div>
            )}
        </div>
    );
}

function TypingIndicator({ chat }) {
    return (
        <div className="flex items-start gap-3">
            <div className={`w-8 h-8 bg-gradient-to-br ${chat.color} rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                {chat.initial}
            </div>
            <div className="bg-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}

function EmptyMessages({ userName }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No messages yet</h3>
            <p className="text-gray-400 text-sm max-w-xs">Start a conversation with {userName}!</p>
        </div>
    );
}

function MessageInput({ message, setMessage, onSend, onKeyPress, isBlocked, onUnblock }) {
    return (
        <div className="bg-slate-800 border-t border-slate-700 p-3 md:p-4">
            {isBlocked ? (
                <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-3">You have blocked this user</p>
                    <button onClick={onUnblock} className="bg-green-600 hover:bg-green-500 text-white py-2 px-6 rounded-lg font-bold transition text-sm">
                        Unblock to Send Messages
                    </button>
                </div>
            ) : (
                <form onSubmit={onSend} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                    <button type="button" className="text-gray-400 hover:text-white p-2 flex-shrink-0">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                        </svg>
                    </button>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={onKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 md:py-3 border-2 border-slate-600 focus:outline-none focus:border-purple-500 transition text-sm md:text-base"
                    />
                    <button type="button" className="text-gray-400 hover:text-white p-2 flex-shrink-0">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                        </svg>
                    </button>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold shadow-lg transition duration-150 text-sm md:text-base flex items-center gap-2"
                    >
                        <span className="hidden sm:inline">Send</span>
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            )}
        </div>
    );
}

function ProfilePanel({ show, onClose, currentChat, isBlocked, onUnblock, getStatusColor }) {
    return (
        <div className={`${show ? 'flex' : 'hidden'} xl:flex xl:w-80 bg-slate-800 border-l border-slate-700 flex-col`}>
            <div className="p-6 border-b border-slate-700 text-center">
                <div className="flex justify-end mb-4">
                    <button onClick={onClose} className="xl:hidden text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className={`w-24 h-24 bg-gradient-to-br ${currentChat.color} rounded-full flex items-center justify-center font-bold text-white text-3xl`}>
                            {currentChat.initial}
                        </div>
                        <div className={`absolute bottom-2 right-2 w-5 h-5 ${getStatusColor(currentChat.status)} border-4 border-slate-800 rounded-full`}></div>
                    </div>
                </div>

                <h3 className="text-white font-bold text-xl mb-1">{currentChat.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{currentChat.status === 'online' ? 'Active now' : 'Offline'}</p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-white mb-1">{currentChat.stats.games}</p>
                        <p className="text-gray-400 text-xs">Games</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-purple-400 mb-1">{currentChat.stats.wins}</p>
                        <p className="text-gray-400 text-xs">Wins</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-orange-400 mb-1">{currentChat.stats.winRate}%</p>
                        <p className="text-gray-400 text-xs">Rate</p>
                    </div>
                </div>

                {isBlocked && (
                    <button onClick={onUnblock} className="w-full bg-green-600 hover:bg-green-500 text-white py-2.5 px-4 rounded-lg font-bold transition text-sm flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Unblock User
                    </button>
                )}
            </div>

            <div className="p-4 border-b border-slate-700">
                <h4 className="text-white font-bold text-sm mb-3">Shared Matches</h4>
                <div className="space-y-2">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 text-xs font-bold">Zombie Land</span>
                            <span className="text-green-400 text-xs">You Won</span>
                        </div>
                        <p className="text-gray-400 text-xs">2 hours ago</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-300 text-xs font-bold">Barbie Pink</span>
                            <span className="text-red-400 text-xs">Ahmed Won</span>
                        </div>
                        <p className="text-gray-400 text-xs">Yesterday</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4">
                <h4 className="text-white font-bold text-sm mb-3">Quick Actions</h4>
                <div className="space-y-2">
                    <button className="w-full bg-slate-700/50 hover:bg-slate-700 text-white py-2.5 px-4 rounded-lg font-bold transition text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                        View Full Profile
                    </button>
                </div>
            </div>
        </div>
    );
}