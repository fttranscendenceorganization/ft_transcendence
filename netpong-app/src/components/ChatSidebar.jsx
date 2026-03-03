import { useState } from 'react';

export default function ChatSidebar({
    showSidebar,
    setShowSidebar,
    friends,
    dmContacts,
    onlinePlayers,
    onlineUserIds,
    isSocketConnected,
    activeConversation,
    globalConversationId,
    onSelectGlobal,
    onSelectPlayer,
    onBlockUser,
    incomingFriendRequests,
    onRespondFriendRequest,
    friendUsername,
    setFriendUsername,
    friendRequestStatus,
    friendRequestError,
    isSendingFriendRequest,
    onSendFriendRequest,
}) {
    const nonFriendDmContacts = dmContacts.filter(c => !friends.some(f => f.id === c.id));
    const allContacts = [...friends, ...nonFriendDmContacts];

    return (
        <div className={`${showSidebar ? 'fixed inset-0 z-40' : 'hidden'} lg:flex lg:relative lg:w-64 bg-slate-800 border-r border-slate-700 flex-col`}>
            {showSidebar && (
                <div className="lg:hidden absolute inset-0 bg-black/50" onClick={() => setShowSidebar(false)} />
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
                    <form onSubmit={onSendFriendRequest} className="space-y-1">
                        <label className="block text-xs text-gray-400 font-semibold">Add friend by username</label>
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
                        {friendRequestStatus && <p className="text-green-400 text-[11px]">{friendRequestStatus}</p>}
                        {friendRequestError && <p className="text-red-400 text-[11px]">{friendRequestError}</p>}
                    </form>
                </div>

                {incomingFriendRequests.length > 0 && (
                    <div className="px-4 pt-3 pb-2 border-b border-slate-700 space-y-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Requests</p>
                        {incomingFriendRequests.map(req => (
                            <div key={req.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center font-bold text-white text-xs overflow-hidden">
                                        {req.requester?.avatarUrl
                                            ? <img src={req.requester.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            : <span>{req.requester?.username?.charAt(0).toUpperCase() ?? '?'}</span>
                                        }
                                    </div>
                                    <p className="text-white text-xs font-semibold">{req.requester?.username ?? 'Unknown'}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => onRespondFriendRequest(req.id, 'ACCEPT')} className="bg-green-600 hover:bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">✓</button>
                                    <button onClick={() => onRespondFriendRequest(req.id, 'REJECT')} className="bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">✗</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div
                        onClick={onSelectGlobal}
                        className={`bg-slate-700/60 hover:bg-slate-700 rounded-lg p-3 transition cursor-pointer flex items-center gap-3 ${activeConversation.type === 'GLOBAL' ? 'ring-2 ring-purple-500/70' : ''}`}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center font-bold text-white">G</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">Global Chat</p>
                            <p className="text-gray-400 text-xs truncate">{isSocketConnected ? `${onlinePlayers.length} online` : 'Offline'}</p>
                        </div>
                    </div>

                    {allContacts.map(player => (
                        <div
                            key={player.id}
                            onClick={() => onSelectPlayer(player.id)}
                            className={`bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 transition group cursor-pointer ${activeConversation.type === 'DM' && activeConversation.targetUserId === player.id ? 'ring-2 ring-purple-500/70' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${player.color} rounded-full flex items-center justify-center font-bold text-white overflow-hidden`}>
                                        {player.avatarUrl
                                            ? <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                                            : <span>{player.initial}</span>
                                        }
                                    </div>
                                    {onlineUserIds.includes(player.id) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm">{player.name}</p>
                                    <p className="text-gray-400 text-xs">{player.game}</p>
                                </div>
                                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={e => { e.stopPropagation(); onSelectPlayer(player.id); }}
                                        className="p-1.5 hover:bg-slate-600 rounded-lg transition"
                                        title="Message"
                                    >
                                        <svg className="w-4 h-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); onBlockUser(player.id); }}
                                        className="p-1.5 hover:bg-slate-600 rounded-lg transition"
                                        title="Block"
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

                <div className="p-4 border-t border-slate-700 text-[11px] text-gray-400">
                    <p>Pick Global or a friend to chat without leaving this page.</p>
                </div>
            </div>
        </div>
    );
}