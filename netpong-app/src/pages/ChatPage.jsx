import { useState, useEffect, useRef, useCallback } from 'react';
import { authFetch } from '../utils/api';
import { getChatSocket } from '../utils/chatSocket';
import { getFriends, getBlockedUsers } from '../utils/userService';

import ChatHeader from '../components/ChatHeader';
import ChatSidebar from '../components/ChatSidebar';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import LiveMatchesSidebar from '../components/LiveMatchesSidebar';
import { BlockedListModal, ClearConfirmModal, ReactionDetailsModal } from '../components/ChatModals';

function mapMessage(msg, currentUserId) {
    return {
        id: msg.id,
        userId: msg.sender.id,
        user: msg.sender.username,
        avatarUrl: msg.sender.avatarUrl || null,
        initial: msg.sender.username?.charAt(0).toUpperCase() ?? '?',
        time: new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        text: msg.content,
        isSent: msg.sender.id === currentUserId,
        color: msg.sender.id === currentUserId ? 'from-orange-500 to-red-600' : 'from-purple-500 to-violet-600',
        delivered: true,
        read: msg.sender.id === currentUserId,
        createdAt: msg.createdAt,
        timeRaw: msg.createdAt,
        replyTo: msg.replyTo ? { id: msg.replyTo.id, user: msg.replyTo.sender?.username ?? 'Unknown', text: msg.replyTo.content } : null,
        reactions: Array.isArray(msg.reactions) ? msg.reactions : [],
    };
}

function filterByClearedAt(history, conversationId) {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(`chatClearedAt:${conversationId}`) : null;
    if (!raw) return history;
    const ts = Number(raw);
    if (Number.isNaN(ts)) return history;
    return history.filter(msg => {
        const t = new Date(msg.createdAt).getTime();
        return Number.isNaN(t) || t > ts;
    });
}

export default function ChatPage() {
    useEffect(() => { document.title = 'Chat - NetPong'; }, []);

    const [currentUser, setCurrentUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [dmContacts, setDmContacts] = useState([]);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [blockedUserDetails, setBlockedUserDetails] = useState([]);
    const [incomingFriendReqs, setIncomingFriendReqs] = useState([]);

    const [messages, setMessages] = useState([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);

    const [message, setMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    const [globalConversationId, setGlobalConversationId] = useState(null);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [activeConversation, setActiveConversation] = useState({
        type: 'GLOBAL', title: 'Global Chat', subtitle: '', avatarInitial: 'G',
        avatarColor: 'from-orange-500 to-red-600', avatarUrl: null, targetUserId: null,
    });

    const [showSidebar, setShowSidebar] = useState(false);
    const [showBlockedList, setShowBlockedList] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [reactionDetails, setReactionDetails] = useState(null);

    const [friendUsername, setFriendUsername] = useState('');
    const [friendRequestStatus, setFriendRequestStatus] = useState(null);
    const [friendRequestError, setFriendRequestError] = useState(null);
    const [isSendingFriendReq, setIsSendingFriendReq] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const messageInputRef = useRef(null);
    const socketRef = useRef(null);
    const observerRef = useRef(null);

    const onlinePlayers = friends.filter(f => onlineUserIds.includes(f.id));
    const isFriend = (userId) => friends.some(f => f.id === userId);

    const fetchFriends = async () => {
        try {
            const users = await getFriends();
            setFriends(users.map((u, i) => ({
                id: u.id, name: u.username, avatarUrl: u.avatarUrl || null,
                initial: u.username?.charAt(0).toUpperCase() ?? '?',
                game: 'NetPong Player',
                color: ['from-orange-500 to-red-600', 'from-purple-500 to-violet-600', 'from-green-500 to-emerald-600', 'from-pink-500 to-rose-600'][i % 4],
            })));
        } catch { }
    };

    const refreshBlocked = async () => {
        try {
            const blocked = await getBlockedUsers();
            setBlockedUsers(blocked.map(u => u.id));
            setBlockedUserDetails(blocked);
        } catch { setBlockedUsers([]); setBlockedUserDetails([]); }
    };

    const fetchIncomingReqs = async () => {
        try {
            const res = await authFetch('/api/users/friends/requests/incoming', { method: 'GET' });
            if (!res.ok) return;
            const data = await res.json();
            setIncomingFriendReqs(Array.isArray(data) ? data : []);
        } catch { }
    };

    useEffect(() => {
        (async () => {
            try {
                const meRes = await authFetch('/api/auth/me', { method: 'GET' });
                if (!meRes.ok) { window.location.href = '/login'; return; }
                const me = await meRes.json();
                setCurrentUser(me);
                await fetchFriends();
                await refreshBlocked();
                const globalRes = await authFetch('/api/chat/global', { method: 'GET' });
                if (globalRes.ok) {
                    const data = await globalRes.json();
                    setGlobalConversationId(data.conversationId);
                    setActiveConversationId(prev => prev || data.conversationId);
                }
                await fetchIncomingReqs();
            } catch { }
        })();
        const pollId = setInterval(fetchIncomingReqs, 10000);
        return () => clearInterval(pollId);
    }, []);

    useEffect(() => {
        if (!activeConversationId || !currentUser) return;
        let mounted = true;
        let socket = null;

        const onConnect = () => setIsSocketConnected(true);
        const onDisconnect = () => setIsSocketConnected(false);
        const onPresenceSnapshot = ({ onlineUserIds }) => setOnlineUserIds(Array.isArray(onlineUserIds) ? onlineUserIds : []);
        const onPresenceUpdate = ({ userId, isOnline }) => setOnlineUserIds(prev => {
            const s = new Set(prev);
            isOnline ? s.add(userId) : s.delete(userId);
            return Array.from(s);
        });
        const onNewMessage = (msg) => {
            if (mounted) setMessages(prev => [...prev, mapMessage(msg, currentUser.id)]);
        };
        const onReactionUpdate = (payload) => {
            setMessages(prev => prev.map(m =>
                m.id === payload.messageId
                    ? { ...m, reactions: Array.isArray(payload.reactions) ? payload.reactions : [] }
                    : m
            ));
        };

        (async () => {
            socket = await getChatSocket();
            if (!socket || !mounted) return;
            socketRef.current = socket;
            socket.emit('joinConversation', { conversationId: activeConversationId });
            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);
            socket.on('presenceSnapshot', onPresenceSnapshot);
            socket.on('presenceUpdate', onPresenceUpdate);
            socket.on('newMessage', onNewMessage);
            socket.on('messageReactionUpdate', onReactionUpdate);
            setIsSocketConnected(socket.connected);

            setIsLoadingMessages(true);
            try {
                const res = await authFetch(`/api/chat/conversations/${activeConversationId}/messages?limit=50`, { method: 'GET' });
                if (res.ok && mounted) {
                    const history = await res.json();
                    setMessages(filterByClearedAt(history, activeConversationId).map(m => mapMessage(m, currentUser.id)));
                }
            } catch { }
            if (mounted) setIsLoadingMessages(false);
        })();

        return () => {
            mounted = false;
            if (socket) {
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
                socket.off('presenceSnapshot', onPresenceSnapshot);
                socket.off('presenceUpdate', onPresenceUpdate);
                socket.off('newMessage', onNewMessage);
                socket.off('messageReactionUpdate', onReactionUpdate);
            }
        };
    }, [activeConversationId, currentUser]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    useEffect(() => { messageInputRef.current?.focus(); }, [activeConversationId, replyingTo]);

    const loadOlderMessages = async () => {
        if (!activeConversationId || isLoadingMore || !hasMoreMessages || messages.length === 0) return;
        setIsLoadingMore(true);
        try {
            const oldest = messages[0];
            const before = encodeURIComponent(new Date(oldest.timeRaw || oldest.createdAt || Date.now()).toISOString());
            const res = await authFetch(`/api/chat/conversations/${activeConversationId}/messages?limit=50&before=${before}`, { method: 'GET' });
            if (!res.ok) return;
            const history = await res.json();
            const filtered = filterByClearedAt(history, activeConversationId);
            if (filtered.length === 0) { setHasMoreMessages(false); return; }
            const mapped = filtered.map(m => mapMessage(m, currentUser.id));
            const container = messagesContainerRef.current;
            const prevHeight = container?.scrollHeight ?? 0;
            const prevScrollTop = container?.scrollTop ?? 0;
            setMessages(prev => [...mapped, ...prev]);
            requestAnimationFrame(() => {
                if (!container) return;
                container.scrollTop = container.scrollHeight - prevHeight + prevScrollTop;
            });
            if (filtered.length < 50) setHasMoreMessages(false);
        } catch { }
        setIsLoadingMore(false);
    };

    const handleMessagesScroll = (e) => { if (e.currentTarget.scrollTop < 50) loadOlderMessages(); };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !activeConversationId) return;
        if (activeConversation.type === 'DM' && blockedUsers.includes(activeConversation.targetUserId)) return;
        try {
            const socket = socketRef.current || await getChatSocket();
            if (!socket) return;
            socket.emit('sendMessage', { conversationId: activeConversationId, content: message.trim(), replyToMessageId: replyingTo?.id });
            setMessage('');
            setReplyingTo(null);
        } catch { }
    };

    const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(e); };

    const handleSendFriendRequest = async (e) => {
        e.preventDefault();
        const username = friendUsername.trim();
        if (!username) { setFriendRequestError('Please enter a username'); return; }
        setFriendRequestError(null); setFriendRequestStatus(null); setIsSendingFriendReq(true);
        try {
            const res = await authFetch('/api/users/friends/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) });
            const data = await res.json().catch(() => null);
            if (!res.ok) { setFriendRequestError(Array.isArray(data?.message) ? data.message[0] : (data?.message || 'Failed')); return; }
            setFriendUsername('');
            if (data?.status === 'ACCEPTED') { setFriendRequestStatus('You are now friends.'); await fetchFriends(); }
            else setFriendRequestStatus('Friend request sent.');
        } catch { setFriendRequestError('Failed to send friend request'); }
        setIsSendingFriendReq(false);
    };

    const handleAddFriendFromMessage = async (userId, username) => {
        if (!username || !userId || !currentUser || userId === currentUser.id || isFriend(userId)) return;
        try {
            const res = await authFetch('/api/users/friends/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) });
            const data = await res.json().catch(() => null);
            if (res.ok && data?.status === 'ACCEPTED') await fetchFriends();
        } catch { }
    };

    const handleRespondFriendRequest = async (requestId, action) => {
        try {
            const res = await authFetch(`/api/users/friends/requests/${requestId}/respond`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
            if (!res.ok) return;
            const data = await res.json();
            setIncomingFriendReqs(prev => prev.filter(r => r.id !== requestId));
            if (data?.status === 'ACCEPTED') await fetchFriends();
        } catch { }
    };

    const openDmWithUser = async (userId) => {
        if (!userId || blockedUsers.includes(userId)) return;
        try {
            let friend = friends.find(f => f.id === userId);
            if (!friend) {
                const r = await authFetch(`/api/users/${userId}`, { method: 'GET' });
                if (r.ok) {
                    const u = await r.json();
                    friend = { id: u.id, name: u.username, avatarUrl: u.avatarUrl || null, initial: u.username?.charAt(0).toUpperCase() ?? '?', color: 'from-purple-500 to-violet-600', game: 'NetPong Player' };
                }
            }
            const dmRes = await authFetch('/api/chat/conversations/dm', { method: 'POST', body: JSON.stringify({ recipientId: userId }) });
            if (!dmRes.ok) return;
            const conv = await dmRes.json();
            setActiveConversation({ type: 'DM', title: friend?.name ?? 'User', subtitle: onlineUserIds.includes(userId) ? 'Active now' : 'Offline', avatarInitial: friend?.initial ?? 'U', avatarColor: friend?.color ?? 'from-purple-500 to-violet-600', avatarUrl: friend?.avatarUrl ?? null, targetUserId: userId });
            setActiveConversationId(conv.conversationId);
            setDmContacts(prev => prev.some(c => c.id === userId) ? prev : [...prev, friend || { id: userId, name: 'User', avatarUrl: null, initial: 'U', color: 'from-purple-500 to-violet-600', game: 'NetPong Player' }]);
        } catch { }
    };

    const handleBlockUser = async (userId) => {
        if (blockedUsers.includes(userId)) return;
        try {
            const res = await authFetch(`/api/users/${userId}/block`, { method: 'POST' });
            if (!res.ok) return;
            setBlockedUsers(prev => [...prev, userId]);
            setMessages(prev => prev.filter(m => m.userId !== userId));
            await refreshBlocked();
        } catch { }
    };

    const handleUnblockUser = async (userId) => {
        try {
            const res = await authFetch(`/api/users/${userId}/unblock`, { method: 'POST' });
            if (!res.ok) return;
            setBlockedUsers(prev => prev.filter(id => id !== userId));
            await refreshBlocked();
        } catch { }
    };

    const handleClearMessages = () => {
        if (activeConversationId) window.localStorage.setItem(`chatClearedAt:${activeConversationId}`, Date.now().toString());
        setMessages([]);
        setShowClearConfirm(false);
    };

    const handleToggleReaction = async (messageId, emoji) => {
        try {
            const socket = socketRef.current || await getChatSocket();
            socket?.emit('reactToMessage', { messageId, emoji });
        } catch { }
    };

    const openReactionDetails = (messageId, emoji) => {
        const msg = messages.find(m => m.id === messageId);
        if (!msg?.reactions?.length) { setReactionDetails(null); return; }
        const map = new Map();
        for (const r of msg.reactions) {
            const ex = map.get(r.emoji) || { emoji: r.emoji, count: 0, users: [] };
            ex.count++;
            if (r.user?.username && !ex.users.includes(r.user.username)) ex.users.push(r.user.username);
            map.set(r.emoji, ex);
        }
        const item = map.get(emoji);
        if (item) setReactionDetails({ messageId, emoji: item.emoji, users: item.users });
    };

    const filteredMessages = messages.filter(m => !blockedUsers.includes(m.userId));
    const isConversationBlocked = activeConversation.type === 'DM' && !!activeConversation.targetUserId && blockedUsers.includes(activeConversation.targetUserId);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-slate-900">

            <ChatHeader
                blockedCount={blockedUserDetails.length}
                onClear={() => setShowClearConfirm(true)}
                onToggleBlocked={async () => { if (!showBlockedList) await refreshBlocked(); setShowBlockedList(p => !p); }}
            />

            <div className="flex flex-1 overflow-hidden">

                <ChatSidebar
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    friends={friends}
                    dmContacts={dmContacts}
                    onlinePlayers={onlinePlayers}
                    onlineUserIds={onlineUserIds}
                    isSocketConnected={isSocketConnected}
                    activeConversation={activeConversation}
                    globalConversationId={globalConversationId}
                    onSelectGlobal={() => {
                        if (!globalConversationId) return;
                        setActiveConversation({ type: 'GLOBAL', title: 'Global Chat', subtitle: isSocketConnected ? `${onlinePlayers.length} online` : 'Offline', avatarInitial: 'G', avatarColor: 'from-orange-500 to-red-600', targetUserId: null });
                        setActiveConversationId(globalConversationId);
                    }}
                    onSelectPlayer={openDmWithUser}
                    onBlockUser={handleBlockUser}
                    incomingFriendRequests={incomingFriendReqs}
                    onRespondFriendRequest={handleRespondFriendRequest}
                    friendUsername={friendUsername}
                    setFriendUsername={setFriendUsername}
                    friendRequestStatus={friendRequestStatus}
                    friendRequestError={friendRequestError}
                    isSendingFriendRequest={isSendingFriendReq}
                    onSendFriendRequest={handleSendFriendRequest}
                />

                <div className="flex-1 flex flex-col bg-slate-900 min-w-0">

                    <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${activeConversation.avatarColor} rounded-full flex items-center justify-center font-bold text-white overflow-hidden`}>
                                {activeConversation.type === 'DM' && activeConversation.avatarUrl
                                    ? <img src={activeConversation.avatarUrl} alt={activeConversation.title} className="w-full h-full object-cover" />
                                    : <span>{activeConversation.avatarInitial}</span>
                                }
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{activeConversation.title}</p>
                                <p className="text-gray-400 text-xs">
                                    {activeConversation.type === 'GLOBAL'
                                        ? (isSocketConnected ? `${onlinePlayers.length} members online` : 'Offline')
                                        : (onlineUserIds.includes(activeConversation.targetUserId) ? 'Active now' : 'Offline')
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {activeConversation.type === 'DM' && activeConversation.targetUserId && currentUser && activeConversation.targetUserId !== currentUser.id && !isFriend(activeConversation.targetUserId) && (
                                <button
                                    onClick={() => handleAddFriendFromMessage(activeConversation.targetUserId, activeConversation.title)}
                                    className="hidden sm:inline-flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                >
                                    Add friend
                                </button>
                            )}
                            <button onClick={() => setShowSidebar(s => !s)} className="lg:hidden text-white">
                                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <MessageList
                        messages={filteredMessages}
                        currentUser={currentUser}
                        hasMoreMessages={hasMoreMessages}
                        isLoadingMore={isLoadingMore}
                        isLoadingMessages={isLoadingMessages}
                        typingUsers={typingUsers}
                        onScroll={handleMessagesScroll}
                        onReply={setReplyingTo}
                        onAddFriend={handleAddFriendFromMessage}
                        onToggleReaction={handleToggleReaction}
                        onOpenReactionDetails={openReactionDetails}
                        onUserClick={openDmWithUser}
                        isFriend={isFriend}
                        messagesEndRef={messagesEndRef}
                        messagesContainerRef={messagesContainerRef}
                    />

                    <MessageInput
                        message={message}
                        setMessage={setMessage}
                        onSend={handleSendMessage}
                        onKeyPress={handleKeyPress}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        isBlocked={isConversationBlocked}
                        inputRef={messageInputRef}
                    />
                </div>

                <LiveMatchesSidebar />
            </div>

            {showBlockedList && <BlockedListModal blockedUserDetails={blockedUserDetails} onUnblock={handleUnblockUser} onClose={() => setShowBlockedList(false)} />}
            {showClearConfirm && <ClearConfirmModal onConfirm={handleClearMessages} onClose={() => setShowClearConfirm(false)} />}
            <ReactionDetailsModal details={reactionDetails} onClose={() => setReactionDetails(null)} />
        </div>
    );
}