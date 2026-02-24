import { useState, useEffect, useRef } from 'react';
import { logout, authFetch } from '../utils/api';
import { getChatSocket } from '../utils/chatSocket';
import { getFriends, getBlockedUsers } from '../utils/userService';

export default function ChatPage() {

    useEffect(() => {
        document.title = "Chat - NetPong";
    }, []);

    const [message, setMessage] = useState('');

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockedUserDetails, setBlockedUserDetails] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [showNotifications, setShowNotifications] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showBlockedList, setShowBlockedList] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [reactionDetails, setReactionDetails] = useState(null);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const messageInputRef = useRef(null);
    const typingTimeoutRef = useRef({});
    const socketRef = useRef(null);
    const [friends, setFriends] = useState([]);
    const [incomingFriendRequests, setIncomingFriendRequests] = useState([]);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [globalConversationId, setGlobalConversationId] = useState(null);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [dmContacts, setDmContacts] = useState([]);
    const [activeConversation, setActiveConversation] = useState({
        type: 'GLOBAL',
        title: 'Global Chat',
        subtitle: '',
        avatarInitial: 'G',
        avatarColor: 'from-orange-500 to-red-600',
        avatarUrl: null,
        targetUserId: null,
    });
    const [currentUser, setCurrentUser] = useState(null);

    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    const [friendUsername, setFriendUsername] = useState('');
    const [friendRequestStatus, setFriendRequestStatus] = useState(null);
    const [friendRequestError, setFriendRequestError] = useState(null);
    const [isSendingFriendRequest, setIsSendingFriendRequest] = useState(false);

    const onlinePlayers = friends.filter(player => onlineUserIds.includes(player.id));

    const liveMatches = [
        { type: 'last', title: 'Last Match', description: 'Ahmed vs Mohammed - Zombie Land', badge: 'Winner Chicken Dinner !!', badgeColor: 'green' },
        { type: 'recent', title: 'Recent Match', description: 'Houdaifa wins Barbie Pink tournament', badge: 'Winner Chicken Dinner !!', badgeColor: 'orange' },
        { type: 'top', title: 'Top Player', description: 'Youssef - 10 wins streak', badge: 'MVP', badgeColor: 'yellow' }
    ];

    const fetchFriends = async () => {
        try {
            const users = await getFriends();
            const mapped = users.map((u, index) => ({
                id: u.id,
                name: u.username,
                avatarUrl: u.avatarUrl || null,
                initial: u.username ? u.username.charAt(0).toUpperCase() : '?',
                game: 'NetPong Player',
                color: ['from-orange-500 to-red-600', 'from-purple-500 to-violet-600', 'from-green-500 to-emerald-600', 'from-pink-500 to-rose-600'][index % 4],
            }));
            setFriends(mapped);
        } catch (error) {
        }
    };

    const refreshBlockedUsers = async () => {
        try {
            const blocked = await getBlockedUsers();
            setBlockedUsers(blocked.map(u => u.id));
            setBlockedUserDetails(blocked);
        } catch (error) {
            setBlockedUsers([]);
            setBlockedUserDetails([]);
        }
    };

    const fetchIncomingFriendRequests = async () => {
        try {
            const res = await authFetch('/api/users/friends/requests/incoming', { method: 'GET' });
            if (!res.ok)
                return;
            const data = await res.json();
            setIncomingFriendRequests(Array.isArray(data) ? data : []);
        } catch (error) {
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const meRes = await authFetch('/api/auth/me', { method: 'GET' });
                if (!meRes.ok) {
                    window.location.href = '/login';
                    return;
                }
                const me = await meRes.json();
                setCurrentUser(me);

                await fetchFriends();

                await refreshBlockedUsers();

                const globalRes = await authFetch('/api/chat/global', { method: 'GET' });
                if (globalRes.ok) {
                    const data = await globalRes.json();
                    setGlobalConversationId(data.conversationId);
                    setActiveConversationId(prev => prev || data.conversationId);
                }

                await fetchIncomingFriendRequests();
            } catch (error) {
            }
        })();
    }, []);

    useEffect(() => {
        if (!activeConversationId || !currentUser) return;

        let isMounted = true;
        let socketInstance = null;

        const handleConnect = () => setIsSocketConnected(true);
        const handleDisconnect = () => setIsSocketConnected(false);
        const handlePresenceSnapshot = ({ onlineUserIds }) => {
            setOnlineUserIds(Array.isArray(onlineUserIds) ? onlineUserIds : []);
        };
        const handlePresenceUpdate = ({ userId, isOnline }) => {
            setOnlineUserIds(prev => {
                const set = new Set(prev);
                if (isOnline) set.add(userId);
                else set.delete(userId);
                return Array.from(set);
            });
        };
        const handleNewMessage = (msg) => {
            setMessages(prev => [
                ...prev,
                {
                    id: msg.id,
                    userId: msg.sender.id,
                    user: msg.sender.username,
                    avatarUrl: msg.sender.avatarUrl || null,
                    initial: msg.sender.username ? msg.sender.username.charAt(0).toUpperCase() : '?',
                    time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    text: msg.content,
                    isSent: msg.sender.id === currentUser.id,
                    color: msg.sender.id === currentUser.id ? 'from-orange-500 to-red-600' : 'from-purple-500 to-violet-600',
                    delivered: true,
                    read: msg.sender.id === currentUser.id,
                    createdAt: msg.createdAt || new Date().toISOString(),
                    timeRaw: msg.createdAt || new Date().toISOString(),
                    replyTo: msg.replyTo
                        ? {
                            id: msg.replyTo.id,
                            user: msg.replyTo.sender?.username || 'Unknown',
                            text: msg.replyTo.content,
                        }
                        : null,
                    reactions: Array.isArray(msg.reactions) ? msg.reactions : [],
                },
            ]);
        };

        const handleReactionUpdate = (payload) => {
            setMessages(prev => prev.map(m =>
                m.id === payload.messageId
                    ? { ...m, reactions: Array.isArray(payload.reactions) ? payload.reactions : [] }
                    : m
            ));
        };

        (async () => {
            const socket = await getChatSocket();
            if (!socket || !isMounted) return;

            socketInstance = socket;
            socketRef.current = socket;

            socket.emit('joinConversation', { conversationId: activeConversationId });

            socket.on('connect', handleConnect);
            socket.on('disconnect', handleDisconnect);
            socket.on('presenceSnapshot', handlePresenceSnapshot);
            socket.on('presenceUpdate', handlePresenceUpdate);
            socket.on('newMessage', handleNewMessage);
            socket.on('messageReactionUpdate', handleReactionUpdate);

            setIsSocketConnected(socket.connected);

            setIsLoadingMessages(true);
            try {
                const res = await authFetch(`/api/chat/conversations/${activeConversationId}/messages?limit=50`, { method: 'GET' });
                if (res.ok) {
                    const history = await res.json();
                    if (!isMounted) return;

                    const clearedAtKey = `chatClearedAt:${activeConversationId}`;
                    const clearedAtRaw = typeof window !== 'undefined' ? window.localStorage.getItem(clearedAtKey) : null;
                    let filteredHistory = history;
                    if (clearedAtRaw) {
                        const clearedTs = Number(clearedAtRaw);
                        if (!Number.isNaN(clearedTs)) {
                            filteredHistory = history.filter(msg => {
                                const createdTs = new Date(msg.createdAt).getTime();
                                return Number.isNaN(createdTs) || createdTs > clearedTs;
                            });
                        }
                    }
                    setMessages(filteredHistory.map(msg => ({
                        id: msg.id,
                        userId: msg.sender.id,
                        user: msg.sender.username,
                        avatarUrl: msg.sender.avatarUrl || null,
                        initial: msg.sender.username ? msg.sender.username.charAt(0).toUpperCase() : '?',
                        time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                        text: msg.content,
                        isSent: msg.sender.id === currentUser.id,
                        color: msg.sender.id === currentUser.id ? 'from-orange-500 to-red-600' : 'from-purple-500 to-violet-600',
                        delivered: true,
                        read: true,
                        createdAt: msg.createdAt,
                        timeRaw: msg.createdAt,
                        replyTo: msg.replyTo
                            ? {
                                id: msg.replyTo.id,
                                user: msg.replyTo.sender?.username || 'Unknown',
                                text: msg.replyTo.content,
                            }
                            : null,
                        reactions: Array.isArray(msg.reactions) ? msg.reactions : [],
                    })));
                }
            } catch (error) {
            }
            if (isMounted) setIsLoadingMessages(false);
        })();

        return () => {
            isMounted = false;
            if (socketInstance) {
                socketInstance.off('connect', handleConnect);
                socketInstance.off('disconnect', handleDisconnect);
                socketInstance.off('presenceSnapshot', handlePresenceSnapshot);
                socketInstance.off('presenceUpdate', handlePresenceUpdate);
                socketInstance.off('newMessage', handleNewMessage);
                socketInstance.off('messageReactionUpdate', handleReactionUpdate);
            }
        };
    }, [activeConversationId, currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (messageInputRef.current) {
            messageInputRef.current.focus();
        }
    }, [activeConversationId, replyingTo]);

    const loadOlderMessages = async () => {
        if (!activeConversationId || isLoadingMore || !hasMoreMessages || messages.length === 0)
            return;

        try {
            setIsLoadingMore(true);

            const oldest = messages[0];
            const before = encodeURIComponent(new Date(oldest.timeRaw || oldest.createdAt || Date.now()).toISOString());

            const res = await authFetch(`/api/chat/conversations/${activeConversationId}/messages?limit=50&before=${before}`, { method: 'GET' });
            if (!res.ok) return;

            const history = await res.json();

            const clearedAtKey = `chatClearedAt:${activeConversationId}`;
            const clearedAtRaw = typeof window !== 'undefined' ? window.localStorage.getItem(clearedAtKey) : null;
            let filteredHistory = history;
            if (clearedAtRaw) {
                const clearedTs = Number(clearedAtRaw);
                if (!Number.isNaN(clearedTs)) {
                    filteredHistory = history.filter(msg => {
                        const createdTs = new Date(msg.createdAt).getTime();
                        return Number.isNaN(createdTs) || createdTs > clearedTs;
                    });
                }
            }

            if (filteredHistory.length === 0) {
                setHasMoreMessages(false);
                return;
            }

            const newMessages = filteredHistory.map(msg => ({
                id: msg.id,
                userId: msg.sender.id,
                user: msg.sender.username,
                avatarUrl: msg.sender.avatarUrl || null,
                initial: msg.sender.username ? msg.sender.username.charAt(0).toUpperCase() : '?',
                time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                text: msg.content,
                isSent: msg.sender.id === currentUser.id,
                color: msg.sender.id === currentUser.id ? 'from-orange-500 to-red-600' : 'from-purple-500 to-violet-600',
                delivered: true,
                read: true,
                createdAt: msg.createdAt,
                timeRaw: msg.createdAt,
                replyTo: msg.replyTo
                    ? {
                        id: msg.replyTo.id,
                        user: msg.replyTo.sender?.username || 'Unknown',
                        text: msg.replyTo.content,
                    }
                    : null,
                reactions: Array.isArray(msg.reactions) ? msg.reactions : [],
            }));

            // Preserve scroll position: measure current top message offset
            const container = messagesContainerRef.current;
            const prevScrollHeight = container ? container.scrollHeight : 0;
            const prevScrollTop = container ? container.scrollTop : 0;

            setMessages(prev => [
                ...newMessages,
                ...prev,
            ]);

            requestAnimationFrame(() => {
                if (!container) return;
                const newScrollHeight = container.scrollHeight;
                container.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
            });

            if (filteredHistory.length < 50) {
                setHasMoreMessages(false);
            }
        } catch (error) {
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleMessagesScroll = (e) => {
        const target = e.currentTarget;
        if (target.scrollTop < 50) {
            loadOlderMessages();
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !activeConversationId)
            return;

        if (
            activeConversation.type === 'DM' &&
            activeConversation.targetUserId &&
            blockedUsers.includes(activeConversation.targetUserId)
        ) {
            return;
        }

        try {
            const socket = socketRef.current || await getChatSocket();
            if (!socket) return;

            socket.emit('sendMessage', {
                conversationId: activeConversationId,
                content: message.trim(),
                replyToMessageId: replyingTo ? replyingTo.id : undefined,
            });
            setMessage('');
            setReplyingTo(null);
        } catch (error) {
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    };

    const handleSendFriendRequest = async (e) => {
        e.preventDefault();
        const username = friendUsername.trim();
        if (!username) {
            setFriendRequestError('Please enter a username');
            setFriendRequestStatus(null);
            return;
        }

        setFriendRequestError(null);
        setFriendRequestStatus(null);
        setIsSendingFriendRequest(true);

        try {
            const res = await authFetch('/api/users/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            let data = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (!res.ok) {
                const message = data && data.message ? data.message : 'Failed to send friend request';
                setFriendRequestError(Array.isArray(message) ? message[0] : message);
                return;
            }

            setFriendUsername('');
            if (data && data.status === 'ACCEPTED') {
                setFriendRequestStatus('Friend request accepted – you are now friends.');
                await fetchFriends();
            } else {
                setFriendRequestStatus('Friend request sent.');
            }
        } catch (error) {
            setFriendRequestError('Failed to send friend request');
        } finally {
            setIsSendingFriendRequest(false);
        }
    };

    const handleAddFriendFromMessage = async (userId, username) => {
        if (!username || !userId || !currentUser || userId === currentUser.id) return;
        if (isFriend(userId)) return;

        try {
            const res = await authFetch('/api/users/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            let data = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (!res.ok) {
                return;
            }

            if (data && data.status === 'ACCEPTED') {
                await fetchFriends();
            }
        } catch (error) {
        }
    };

    const handleRespondFriendRequest = async (requestId, action) => {
        try {
            const res = await authFetch(`/api/users/friends/requests/${requestId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (!res.ok)
                return;

            const data = await res.json();
            setIncomingFriendRequests(prev => prev.filter(req => req.id !== requestId));

            if (data && data.status === 'ACCEPTED')
                await fetchFriends();
        } catch (error) {
        }
    };

    const openDmWithUser = async (userId) => {
        if (!userId || blockedUsers.includes(userId)) return;
        try {
            let friend = friends.find(f => f.id === userId);
            if (!friend) {
                const userRes = await authFetch(`/api/users/${userId}`, { method: 'GET' });
                if (userRes.ok) {
                    const u = await userRes.json();
                    friend = {
                        id: u.id,
                        name: u.username,
                        avatarUrl: u.avatarUrl || null,
                        initial: u.username ? u.username.charAt(0).toUpperCase() : '?',
                        color: 'from-purple-500 to-violet-600',
                        game: 'NetPong Player',
                    };
                }
            }

            const dmRes = await authFetch('/api/chat/conversations/dm', {
                method: 'POST',
                body: JSON.stringify({ recipientId: userId }),
            });
            if (!dmRes.ok) return;
            const conv = await dmRes.json();
            setActiveConversation({
                type: 'DM',
                title: friend ? friend.name : 'User',
                subtitle: onlineUserIds.includes(userId) ? 'Active now' : 'Offline',
                avatarInitial: friend && friend.initial ? friend.initial : 'U',
                avatarColor: friend && friend.color ? friend.color : 'from-purple-500 to-violet-600',
                avatarUrl: friend && friend.avatarUrl ? friend.avatarUrl : null,
                targetUserId: userId,
            });
            setActiveConversationId(conv.conversationId);

            setDmContacts(prev => {
                if (prev.some(c => c.id === userId)) return prev;
                const base = friend || {
                    id: userId,
                    name: 'User',
                    avatarUrl: null,
                    initial: 'U',
                    color: 'from-purple-500 to-violet-600',
                    game: 'NetPong Player',
                };
                return [...prev, base];
            });
        } catch (error) {
        }
    };

    const handlePlayerClick = (playerId) => {
        openDmWithUser(playerId);
    };

    const handleMessageUserClick = (userId) => {
        openDmWithUser(userId);
    };

    const handleBlockUser = async (userId) => {
        if (blockedUsers.includes(userId)) return;
        try {
            const res = await authFetch(`/api/users/${userId}/block`, { method: 'POST' });
            if (!res.ok) return;
            setBlockedUsers(prev => [...prev, userId]);
            setMessages(prev => prev.filter(msg => msg.userId !== userId));
            await refreshBlockedUsers();
        } catch (error) {
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            const res = await authFetch(`/api/users/${userId}/unblock`, { method: 'POST' });
            if (!res.ok) return;
            setBlockedUsers(prev => prev.filter(id => id !== userId));
            await refreshBlockedUsers();
        } catch (error) {
        }
    };

    const handleToggleBlockedList = async () => {
        if (!showBlockedList) {
            await refreshBlockedUsers();
        }
        setShowBlockedList(prev => !prev);
    };

    const handleClearMessages = () => {
        if (activeConversationId && typeof window !== 'undefined') {
            window.localStorage.setItem(`chatClearedAt:${activeConversationId}`, Date.now().toString());
        }
        setMessages([]);
        setShowClearConfirm(false);
    };

    const handleAcceptGameInvite = (notification) => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        alert(`Joining ${notification.game} game with ${notification.from}!`);
    };

    const handleDeclineGameInvite = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const dismissNotification = (notificationId) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };
    const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const filteredMessages = messages.filter(msg => !blockedUsers.includes(msg.userId));

    const isConversationBlocked =
        activeConversation.type === 'DM' &&
        !!activeConversation.targetUserId &&
        blockedUsers.includes(activeConversation.targetUserId);

    const isFriend = (userId) => friends.some(f => f.id === userId);

    const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

    const handleToggleReaction = async (messageId, emoji) => {
        try {
            const socket = socketRef.current || await getChatSocket();
            if (!socket) return;
            socket.emit('reactToMessage', { messageId, emoji });
        } catch (error) {
        }
    };

    const summarizeReactions = (msg) => {
        if (!msg.reactions || msg.reactions.length === 0) return [];
        const map = new Map();
        for (const r of msg.reactions) {
            const key = r.emoji;
            const existing = map.get(key) || { emoji: r.emoji, count: 0, reactedByMe: false, users: [] };
            existing.count += 1;
            if (currentUser && r.user && r.user.id === currentUser.id) {
                existing.reactedByMe = true;
            }
            if (r.user && r.user.username && !existing.users.includes(r.user.username)) {
                existing.users.push(r.user.username);
            }
            map.set(key, existing);
        }
        return Array.from(map.values());
    };

    const openReactionDetails = (messageId, emoji) => {
        const msg = messages.find(m => m.id === messageId);
        if (!msg || !msg.reactions || msg.reactions.length === 0) {
            setReactionDetails(null);
            return;
        }
        const summary = summarizeReactions(msg);
        const item = summary.find(r => r.emoji === emoji);
        if (!item) {
            setReactionDetails(null);
            return;
        }
        setReactionDetails({
            messageId,
            emoji: item.emoji,
            users: item.users || [],
        });
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-900">
            <header className="w-full bg-slate-900 py-4 relative flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-20 shadow-md gap-4 md:gap-0 border-b border-slate-800">
                <a href="/home" className="flex items-center group">
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
                        onClick={handleToggleBlockedList}
                        className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span className="hidden sm:inline">Blocked ({blockedUserDetails.length})</span>
                    </button>
                    <button
                        onClick={async () => { await logout(); }}
                        className="bg-red-700 hover:bg-red-600 text-white py-2 px-4 md:px-5 font-bold rounded-lg shadow-xl transition text-sm md:text-base">
                        Logout
                    </button>
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
                                {blockedUserDetails.map(user => (
                                    <div key={user.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center font-bold text-white overflow-hidden`}>
                                                {user.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt={user.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{user.username ? user.username.charAt(0).toUpperCase() : '?'}</span>
                                                )}
                                            </div>
                                            <span className="text-white font-bold">{user.username}</span>
                                        </div>
                                        <button
                                            onClick={() => handleUnblockUser(user.id)}
                                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition"
                                        >
                                            Unblock
                                        </button>
                                    </div>
                                ))}
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
                                    <h2 className="text-white font-bold text-lg mb-1">Friends</h2>
                                    <p className="text-gray-400 text-sm">{friends.length} friends • {onlinePlayers.length} online</p>
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

                        <div className="px-4 pt-3 pb-2 border-b border-slate-700">
                            <form onSubmit={handleSendFriendRequest} className="space-y-1">
                                <label className="block text-xs text-gray-400 font-semibold">
                                    Add friend by username
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={friendUsername}
                                            onChange={(e) => setFriendUsername(e.target.value)}
                                            placeholder="Enter username"
                                            className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-3 py-1.5 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSendingFriendRequest}
                                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition"
                                    >
                                        Add
                                    </button>
                                </div>
                                {friendRequestStatus && (
                                    <p className="text-green-400 text-[11px]">
                                        {friendRequestStatus}
                                    </p>
                                )}
                                {friendRequestError && (
                                    <p className="text-red-400 text-[11px]">
                                        {friendRequestError}
                                    </p>
                                )}
                            </form>
                        </div>

                        {(() => {
                            const nonFriendDmContacts = dmContacts.filter(c => !friends.some(f => f.id === c.id));
                            const allContacts = [...friends, ...nonFriendDmContacts];

                            return (
                                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                    
                                    <div
                                        className={`bg-slate-700/60 hover:bg-slate-700 rounded-lg p-3 transition cursor-pointer flex items-center gap-3 ${activeConversation.type === 'GLOBAL' ? 'ring-2 ring-purple-500/70' : ''}`}
                                        onClick={() => {
                                            if (!globalConversationId) return;
                                            setActiveConversation({
                                                type: 'GLOBAL',
                                                title: 'Global Chat',
                                                subtitle: isSocketConnected ? `${onlinePlayers.length} members online` : 'Offline',
                                                avatarInitial: 'G',
                                                avatarColor: 'from-orange-500 to-red-600',
                                                targetUserId: null,
                                            });
                                            setActiveConversationId(globalConversationId);
                                        }}
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center font-bold text-white">
                                                G
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold text-sm truncate">Global Chat</p>
                                            <p className="text-gray-400 text-xs truncate">{isSocketConnected ? `${onlinePlayers.length} members online` : 'Offline'}</p>
                                        </div>
                                    </div>

                                    
                                    {allContacts.map((player) => (
                                        <div
                                            key={player.id}
                                            className={`bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 transition group cursor-pointer ${activeConversation.type === 'DM' && activeConversation.targetUserId === player.id ? 'ring-2 ring-purple-500/70' : ''}`}
                                            onClick={() => handlePlayerClick(player.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className={`w-10 h-10 bg-gradient-to-br ${player.color} rounded-full flex items-center justify-center font-bold text-white overflow-hidden`}>
                                                        {player.avatarUrl ? (
                                                            <img
                                                                src={player.avatarUrl}
                                                                alt={player.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>{player.initial}</span>
                                                        )}
                                                    </div>
                                                    {onlineUserIds.includes(player.id) && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-bold text-sm">{player.name}</p>
                                                    <p className="text-gray-400 text-xs">{player.game}</p>
                                                </div>
                                                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handlePlayerClick(player.id); }}
                                                        className="p-1.5 hover:bg-slate-600 rounded-lg transition"
                                                        title="Message"
                                                    >
                                                        <svg className="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleBlockUser(player.id); }}
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
                            );
                        })()}

                        <div className="p-4 border-t border-slate-700 text-[11px] text-gray-400">
                            <p>Everything happens here: pick Global or a friend to chat without leaving this page.</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col bg-slate-900">
                    <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${activeConversation.avatarColor} rounded-full flex items-center justify-center font-bold text-white overflow-hidden`}>
                                {activeConversation.type === 'DM' && activeConversation.avatarUrl ? (
                                    <img
                                        src={activeConversation.avatarUrl}
                                        alt={activeConversation.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span>{activeConversation.avatarInitial}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{activeConversation.title}</p>
                                <p className="text-gray-400 text-xs">{activeConversation.type === 'GLOBAL' ? (isSocketConnected ? `${onlinePlayers.length} members online` : 'Offline') : (onlineUserIds.includes(activeConversation.targetUserId) ? 'Active now' : 'Offline')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeConversation.type === 'DM'
                                && activeConversation.targetUserId
                                && currentUser
                                && activeConversation.targetUserId !== currentUser.id
                                && !isFriend(activeConversation.targetUserId) && (
                                    <button
                                        type="button"
                                        onClick={() => handleAddFriendFromMessage(activeConversation.targetUserId, activeConversation.title)}
                                        className="hidden sm:inline-flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                    >
                                        <span>Add friend</span>
                                    </button>
                                )}
                            <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden text-white">
                                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="border-b border-slate-800 bg-slate-900 px-4 py-3">
                        <div className="max-w-4xl mx-auto space-y-3">
                            {incomingFriendRequests.length > 0 && (
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-2">Friend Requests</h3>
                                    <div className="space-y-2">
                                        {incomingFriendRequests.map((req) => (
                                            <div
                                                key={req.id}
                                                className="flex items-center justify-between bg-slate-800 rounded-lg p-2 border border-slate-700"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                                                        {req.requester && req.requester.avatarUrl ? (
                                                            <img
                                                                src={req.requester.avatarUrl}
                                                                alt={req.requester.username || 'User'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>
                                                                {req.requester && req.requester.username
                                                                    ? req.requester.username.charAt(0).toUpperCase()
                                                                    : '?'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-semibold">
                                                            {req.requester ? req.requester.username : 'Unknown'}
                                                        </p>
                                                        <p className="text-gray-400 text-xs">wants to be your friend</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRespondFriendRequest(req.id, 'ACCEPT')}
                                                        className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold transition"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRespondFriendRequest(req.id, 'REJECT')}
                                                        className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold transition"
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        ref={messagesContainerRef}
                        onScroll={handleMessagesScroll}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800 relative"
                    >
                        {isLoadingMessages && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-10">
                                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
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
                                {hasMoreMessages && (
                                    <div className="flex justify-center mb-2 text-xs text-gray-400">
                                        {isLoadingMore ? 'Loading older messages...' : 'Scroll up to load older messages'}
                                    </div>
                                )}
                                {filteredMessages.map((msg) => (
                                    <div key={msg.id} className={`group flex ${msg.isSent ? 'justify-end' : 'justify-start'} items-start gap-3`}>
                                        {!msg.isSent && (
                                            <div
                                                onClick={() => handleMessageUserClick(msg.userId)}
                                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-110 transition-transform overflow-hidden bg-slate-700"
                                                title={`Click to message ${msg.user}`}
                                            >
                                                {msg.avatarUrl ? (
                                                    <img
                                                        src={msg.avatarUrl}
                                                        alt={msg.user}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-white text-xs">
                                                        {msg.initial}
                                                    </span>
                                                )}
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
                                            <div className={`${msg.isSent ? 'bg-gradient-to-r from-orange-600 to-red-600 rounded-tr-none' : 'bg-slate-700 rounded-tl-none'} text-white rounded-2xl px-4 py-2 max-w-xs md:max-w-md shadow-lg break-words`}>
                                                {msg.replyTo && (
                                                    <div className="mb-1 px-3 py-1 rounded-md bg-slate-800/80 text-xs text-gray-200 border-l-2 border-purple-500 max-w-full">
                                                        <span className="font-semibold">{msg.replyTo.user}</span>
                                                        <span className="mx-1 text-gray-500">•</span>
                                                        <span className="break-words">{msg.replyTo.text}</span>
                                                    </div>
                                                )}
                                                <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                                            </div>
                                            <div className={`flex items-center gap-2 mt-1 text-[11px] text-gray-300 ${msg.isSent ? 'justify-end' : 'justify-start'}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => setReplyingTo({ id: msg.id, user: msg.user, text: msg.text })}
                                                    className="hover:text-purple-300 transition-colors"
                                                >
                                                    Reply
                                                </button>
                                                {!msg.isSent && !isFriend(msg.userId) && currentUser && msg.userId !== currentUser.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddFriendFromMessage(msg.userId, msg.user)}
                                                        className="hover:text-green-300 transition-colors"
                                                    >
                                                        Add friend
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {reactionEmojis.map((emoji) => (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            onClick={() => handleToggleReaction(msg.id, emoji)}
                                                            className="hover:scale-110 transition-transform"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {summarizeReactions(msg).length > 0 && (
                                                <div className={`flex flex-wrap gap-1 mt-1 ${msg.isSent ? 'justify-end' : 'justify-start'}`}>
                                                    {summarizeReactions(msg).map((r) => (
                                                        <button
                                                            key={r.emoji}
                                                            type="button"
                                                            onClick={() => openReactionDetails(msg.id, r.emoji)}
                                                            title={r.users && r.users.length ? r.users.join(', ') : ''}
                                                            className={`px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 bg-slate-700/80 ${r.reactedByMe ? 'ring-1 ring-purple-400' : ''}`}
                                                        >
                                                            <span>{r.emoji}</span>
                                                            <span className="text-gray-200">{r.count}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
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
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-slate-700">
                                                {msg.avatarUrl ? (
                                                    <img
                                                        src={msg.avatarUrl}
                                                        alt={msg.user}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-white text-xs">
                                                        {msg.initial}
                                                    </span>
                                                )}
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
                        {isConversationBlocked && (
                            <div className="max-w-4xl mx-auto mb-2 px-3 py-2 rounded-lg bg-red-900/40 text-xs md:text-sm text-red-200">
                                You blocked this user. Unblock them to send messages.
                            </div>
                        )}
                        {replyingTo && (
                            <div className="max-w-4xl mx-auto mb-2 px-3 py-2 rounded-lg bg-slate-700 flex items-center justify-between gap-3 text-xs md:text-sm">
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-orange-300 font-semibold">Replying to {replyingTo.user}</span>
                                    <span className="text-gray-100 truncate max-w-xs md:max-w-md">{replyingTo.text}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="text-gray-300 hover:text-white flex-shrink-0"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyPress}
                                ref={messageInputRef}
                                placeholder="Type your message..."
                                disabled={isConversationBlocked}
                                className="flex-1 bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 md:py-3 border-2 border-slate-600 focus:outline-none focus:border-orange-500 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                type="submit"
                                disabled={isConversationBlocked}
                                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold shadow-lg transition duration-150 text-sm md:text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {reactionDetails && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
                    onClick={() => setReactionDetails(null)}
                >
                    <div
                        className="bg-slate-800 rounded-xl w-full max-w-sm p-4 shadow-2xl border border-slate-600"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                <span className="text-lg">{reactionDetails.emoji}</span>
                                <span>Reactions</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setReactionDetails(null)}
                                className="text-gray-300 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {reactionDetails.users.length === 0 ? (
                            <p className="text-gray-300 text-sm">No one has reacted yet.</p>
                        ) : (
                            <ul className="max-h-64 overflow-y-auto space-y-1">
                                {reactionDetails.users.map((name) => (
                                    <li
                                        key={name}
                                        className="px-3 py-1 rounded-lg bg-slate-700 text-sm text-white flex items-center gap-2"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                                        <span>{name}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}