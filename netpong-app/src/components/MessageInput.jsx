export default function MessageInput({
    message,
    setMessage,
    onSend,
    onKeyPress,
    replyingTo,
    setReplyingTo,
    isBlocked,
    inputRef,
}) {
    return (
        <div className="bg-slate-800 border-t border-slate-700 p-3 md:p-4">
            {isBlocked && (
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
                    <button type="button" onClick={() => setReplyingTo(null)} className="text-gray-300 hover:text-white flex-shrink-0">
                        ✕
                    </button>
                </div>
            )}

            <form onSubmit={onSend} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                <input
                    id="message"
                    name="message"
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={onKeyPress}
                    ref={inputRef}
                    placeholder="Type your message..."
                    autoComplete="off"
                    disabled={isBlocked}
                    className="flex-1 bg-slate-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 md:py-3 border-2 border-slate-600 focus:outline-none focus:border-orange-500 transition text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={isBlocked}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-bold shadow-lg transition duration-150 text-sm md:text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>Send</span>
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                </button>
            </form>
        </div>
    );
}