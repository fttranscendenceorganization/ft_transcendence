import { useRef, useEffect } from 'react';

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

function summarizeReactions(msg, currentUserId) {
    if (!msg.reactions || msg.reactions.length === 0) return [];
    const map = new Map();
    for (const r of msg.reactions) {
        const existing = map.get(r.emoji) || { emoji: r.emoji, count: 0, reactedByMe: false, users: [] };
        existing.count += 1;
        if (currentUserId && r.user?.id === currentUserId) existing.reactedByMe = true;
        if (r.user?.username && !existing.users.includes(r.user.username)) existing.users.push(r.user.username);
        map.set(r.emoji, existing);
    }
    return Array.from(map.values());
}

export default function MessageList({
    messages,
    currentUser,
    hasMoreMessages,
    isLoadingMore,
    isLoadingMessages,
    typingUsers,
    onScroll,
    onReply,
    onAddFriend,
    onToggleReaction,
    onOpenReactionDetails,
    onUserClick,
    isFriend,
    messagesEndRef,
    messagesContainerRef,
}) {
    return (
        <div
            ref={messagesContainerRef}
            onScroll={onScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800 relative"
        >
            {isLoadingMessages && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-10">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">No messages yet</h3>
                    <p className="text-gray-400 text-sm max-w-xs">Start chatting with other players in the global chat!</p>
                </div>
            ) : (
                <>
                    {hasMoreMessages && (
                        <div className="flex justify-center mb-2 text-xs text-gray-400">
                            {isLoadingMore ? 'Loading older messages...' : 'Scroll up to load older messages'}
                        </div>
                    )}

                    {messages.map(msg => {
                        const reactions = summarizeReactions(msg, currentUser?.id);
                        return (
                            <div key={msg.id} className={`group flex ${msg.isSent ? 'justify-end' : 'justify-start'} items-start gap-3`}>

                                {!msg.isSent && (
                                    <div
                                        onClick={() => onUserClick(msg.userId)}
                                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-110 transition-transform overflow-hidden bg-slate-700"
                                        title={`Click to message ${msg.user}`}
                                    >
                                        {msg.avatarUrl
                                            ? <img src={msg.avatarUrl} alt={msg.user} className="w-full h-full object-cover" />
                                            : <span className="font-bold text-white text-xs">{msg.initial}</span>
                                        }
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
                                                    onClick={() => onUserClick(msg.userId)}
                                                    className="text-white font-bold text-sm hover:text-purple-400 cursor-pointer transition-colors"
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
                                        <button type="button" onClick={() => onReply({ id: msg.id, user: msg.user, text: msg.text })} className="hover:text-purple-300 transition-colors">
                                            Reply
                                        </button>
                                        {!msg.isSent && !isFriend(msg.userId) && currentUser && msg.userId !== currentUser.id && (
                                            <button type="button" onClick={() => onAddFriend(msg.userId, msg.user)} className="hover:text-green-300 transition-colors">
                                                Add friend
                                            </button>
                                        )}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {reactionEmojis.map(emoji => (
                                                <button key={emoji} type="button" onClick={() => onToggleReaction(msg.id, emoji)} className="hover:scale-110 transition-transform">
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {reactions.length > 0 && (
                                        <div className={`flex flex-wrap gap-1 mt-1 ${msg.isSent ? 'justify-end' : 'justify-start'}`}>
                                            {reactions.map(r => (
                                                <button
                                                    key={r.emoji}
                                                    type="button"
                                                    onClick={() => onOpenReactionDetails(msg.id, r.emoji)}
                                                    title={r.users?.join(', ') ?? ''}
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
                                        {msg.avatarUrl
                                            ? <img src={msg.avatarUrl} alt={msg.user} className="w-full h-full object-cover" />
                                            : <span className="font-bold text-white text-xs">{msg.initial}</span>
                                        }
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {typingUsers.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm italic animate-pulse">
                            <div className="flex gap-1">
                                {[0, 150, 300].map(d => (
                                    <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                ))}
                            </div>
                            <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                        </div>
                    )}
                </>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}