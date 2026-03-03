export function BlockedListModal({ blockedUserDetails, onUnblock, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold text-xl">Blocked Users</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {blockedUserDetails.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No blocked users</p>
                ) : (
                    <div className="space-y-2">
                        {blockedUserDetails.map(user => (
                            <div key={user.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center font-bold text-white overflow-hidden">
                                        {user.avatarUrl
                                            ? <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                                            : <span>{user.username?.charAt(0).toUpperCase() ?? '?'}</span>
                                        }
                                    </div>
                                    <span className="text-white font-bold">{user.username}</span>
                                </div>
                                <button
                                    onClick={() => onUnblock(user.id)}
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
    );
}

export function ClearConfirmModal({ onConfirm, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
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
                    All messages will be cleared from your device. This will not affect other users' chat history.
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-4 rounded-lg font-bold transition">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
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
    );
}

export function ReactionDetailsModal({ details, onClose }) {
    if (!details) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl w-full max-w-sm p-4 shadow-2xl border border-slate-600" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="text-lg">{details.emoji}</span>
                        <span>Reactions</span>
                    </h3>
                    <button type="button" onClick={onClose} className="text-gray-300 hover:text-white">✕</button>
                </div>
                {details.users.length === 0 ? (
                    <p className="text-gray-300 text-sm">No one has reacted yet.</p>
                ) : (
                    <ul className="max-h-64 overflow-y-auto space-y-1">
                        {details.users.map(name => (
                            <li key={name} className="px-3 py-1 rounded-lg bg-slate-700 text-sm text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-400" />
                                <span>{name}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}