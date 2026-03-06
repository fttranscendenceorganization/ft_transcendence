import { useEffect, useState, useRef, useCallback, forwardRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';

const MODE_ICON = {
    ZOMBIE_LAND: '🧟',
    SOUL_SOCIETY: '⚔️',
    KITTY_CAT: '🐱',
    JOKER: '🃏',
};
const MODE_LABEL = {
    ZOMBIE_LAND: 'Zombie Land',
    SOUL_SOCIETY: 'Soul Society',
    KITTY_CAT: 'Kitty Cat',
    JOKER: 'Joker',
};

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function PlayerHistoryPanel({ player, onClose, currentUserId }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [friendSent, setFriendSent] = useState(false);
    const [friendLoading, setFriendLoading] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        if (!player) return;
        setVisible(false);
        setHistory([]);
        setIsFriend(false);
        setFriendSent(false);
        setLoading(true);

        Promise.all([
            authFetch('/api/game/history/' + player.id, { method: 'GET' })
                .then(r => r.ok ? r.json() : [])
                .catch(() => []),
            authFetch('/api/users/friends', { method: 'GET' })
                .then(r => r.ok ? r.json() : [])
                .catch(() => []),
        ]).then(([historyData, friends]) => {
            setHistory(Array.isArray(historyData) ? historyData : []);
            const already = Array.isArray(friends) && friends.some(f => f.id === player.id);
            setIsFriend(already);
            setLoading(false);
        });

        requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, [player]);

    useEffect(() => {
        if (!player) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [player, onClose]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleAddFriend = async () => {
        if (friendLoading || isFriend || friendSent) return;
        setFriendLoading(true);
        try {
            const res = await authFetch('/api/users/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: player.username }),
            });
            if (res.ok) setFriendSent(true);
        } catch {
        } finally {
            setFriendLoading(false);
        }
    };

    if (!player) return null;

    function FriendButton() {
        if (isFriend) {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Friends
                </div>
            );
        }
        if (friendSent) {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pending
                </div>
            );
        }
        return (
            <button
                onClick={handleAddFriend}
                disabled={friendLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all duration-200 hover:scale-105 shadow-lg shadow-green-900/40"
            >
                {friendLoading ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                )}
                Add Friend
            </button>
        );
    }

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                style={{ opacity: visible ? 1 : 0 }}
            />
            <div
                ref={panelRef}
                className="fixed top-0 right-0 h-full z-50 w-full max-w-sm flex flex-col"
                style={{
                    transform: visible ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    background: 'rgba(10,12,20,0.98)',
                    borderLeft: '1px solid rgba(139,92,246,0.2)',
                    boxShadow: '-12px 0 60px rgba(0,0,0,0.6)',
                }}
            >
                <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent flex-shrink-0" />

                <div className="flex-shrink-0 p-5 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={player.avatar}
                                alt={player.username}
                                className="w-11 h-11 rounded-full object-cover border-2 border-violet-500/40"
                                onError={e => { e.target.src = '/images/avatar.webp'; }}
                            />
                            <div>
                                <p className="text-white font-black text-base">{player.username}</p>
                                <p className="text-gray-500 text-xs">{player.rank} · Lv.{player.level}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-4">
                        {player.id !== currentUserId && <FriendButton />}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-white/[0.04] rounded-xl p-2.5 text-center border border-white/[0.05]">
                            <p className="text-emerald-400 font-black text-lg">{player.wins}</p>
                            <p className="text-gray-600 text-[10px] uppercase tracking-wider font-bold">Wins</p>
                        </div>
                        <div className="bg-white/[0.04] rounded-xl p-2.5 text-center border border-white/[0.05]">
                            <p className="text-red-400 font-black text-lg">{player.losses}</p>
                            <p className="text-gray-600 text-[10px] uppercase tracking-wider font-bold">Losses</p>
                        </div>
                        <div className="bg-white/[0.04] rounded-xl p-2.5 text-center border border-white/[0.05]">
                            <p className="text-violet-400 font-black text-lg">{player.winRate}%</p>
                            <p className="text-gray-600 text-[10px] uppercase tracking-wider font-bold">Win Rate</p>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 px-5 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Last Matches</p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-5 space-y-2">
                    {loading && [0, 1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-white/[0.03] rounded-xl animate-pulse" style={{ animationDelay: i * 60 + 'ms' }} />
                    ))}

                    {!loading && history.length === 0 && (
                        <div className="py-12 text-center">
                            <p className="text-4xl mb-2">🏒</p>
                            <p className="text-gray-600 text-sm">No matches yet</p>
                        </div>
                    )}

                    {!loading && history.map((match, i) => {
                        const isWin = match.result === 'WIN';
                        const modeIcon = MODE_ICON[match.mode] || '🎮';
                        const modeLabel = MODE_LABEL[match.mode] || match.mode;
                        const oppIcon = match.opponentType === 'AI' ? '🤖' : null;
                        return (
                            <div
                                key={match.id}
                                className="flex items-center gap-3 rounded-xl border border-white/[0.05] px-3 py-2.5 hover:border-violet-500/20 transition-all"
                                style={{
                                    background: 'rgba(255,255,255,0.025)',
                                    transform: visible ? 'translateX(0)' : 'translateX(16px)',
                                    opacity: visible ? 1 : 0,
                                    transition: 'transform 0.35s ease ' + (i * 45 + 80) + 'ms, opacity 0.35s ease ' + (i * 45 + 80) + 'ms',
                                    borderLeft: '3px solid ' + (isWin ? '#10b981' : '#ef4444'),
                                }}
                            >
                                <div className={'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ' + (isWin ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400')}>
                                    {isWin ? 'W' : 'L'}
                                </div>
                                <div className="flex-shrink-0">
                                    {oppIcon ? (
                                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-sm">{oppIcon}</div>
                                    ) : (
                                        <img
                                            src={match.opponentAvatarUrl || '/images/avatar.png'}
                                            alt={match.opponentName}
                                            className="w-7 h-7 rounded-full object-cover border border-white/10"
                                            onError={e => { e.target.src = '/images/avatar.png'; }}
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-semibold truncate">{match.opponentName}</p>
                                    <p className="text-gray-600 text-[10px] truncate">{modeIcon} {modeLabel} · {formatDate(match.createdAt)}</p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                    <p className="text-xs font-black text-white tabular-nums">
                                        <span className={isWin ? 'text-emerald-400' : 'text-red-400'}>{match.myScore}</span>
                                        <span className="text-gray-600">:</span>
                                        <span className="text-gray-400">{match.opponentScore}</span>
                                    </p>
                                    <p className={'text-[10px] font-bold ' + (isWin ? 'text-orange-400' : 'text-gray-600')}>
                                        +{match.xpEarned} XP
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default function Leaderboard() {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const observer = useRef();

    useEffect(() => {
        document.title = "Leaderboard - NetPong";
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const [meRes, playersRes] = await Promise.all([
                    authFetch('/api/auth/me', { method: 'GET' }),
                    authFetch('/api/users?page=1&limit=20', { method: 'GET' }),
                ]);
                if (!meRes.ok || !playersRes.ok) { navigate('/login'); return; }
                const me = await meRes.json();
                const data = await playersRes.json();
                if (me) setCurrentUserId(me.id);
                const newPlayers = (data.items || []).map(u => ({
                    id: u.id,
                    username: u.username,
                    avatar: u.avatarUrl || '/images/avatar.webp',
                    level: u.level,
                    wins: u.wins,
                    losses: u.losses,
                    totalXp: u.totalXp || 0,
                    winRate: u.winrate || (u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 100) : 0),
                    points: u.points || 0,
                }));
                setPlayers(newPlayers.sort((a, b) => b.totalXp - a.totalXp || b.points - a.points || b.winRate - a.winRate));
                setHasMore(newPlayers.length === 20);
            } catch {
                navigate('/login');
            } finally {
                setLoadingInitial(false);
                setTimeout(() => setIsVisible(true), 100);
            }
        };
        init();
    }, [navigate]);

    const fetchMore = useCallback(async (pageNum) => {
        setLoading(true);
        try {
            const res = await authFetch('/api/users?page=' + pageNum + '&limit=20', { method: 'GET' });
            if (!res.ok) return;
            const data = await res.json();
            const newPlayers = (data.items || []).map(u => ({
                id: u.id,
                username: u.username,
                avatar: u.avatarUrl || '/images/avatar.webp',
                level: u.level,
                wins: u.wins,
                losses: u.losses,
                totalXp: u.totalXp || 0,
                winRate: u.winrate || (u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 100) : 0),
                points: u.points || 0,
            }));
            setPlayers(prev => [...prev, ...newPlayers].sort((a, b) => b.totalXp - a.totalXp || b.points - a.points || b.winRate - a.winRate));
            setHasMore(newPlayers.length === 20);
        } catch {
            setHasMore(false);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (page > 1) fetchMore(page);
    }, [page, fetchMore]);

    const lastPlayerRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new window.IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const assignRank = (index) => {
        if (index === 0) return 'Diamond';
        if (index === 1) return 'Platinum';
        if (index === 2) return 'Gold';
        if (index < 10) return 'Silver';
        return 'Bronze';
    };

    const getRankColor = (rank) => ({
        'Diamond': 'from-cyan-400 to-blue-500',
        'Platinum': 'from-gray-300 to-gray-500',
        'Gold': 'from-yellow-400 to-yellow-600',
        'Silver': 'from-gray-400 to-gray-600',
        'Bronze': 'from-orange-400 to-orange-600',
    }[rank] || 'from-gray-400 to-gray-600');

    const getRankBadge = (rank) => ({
        'Diamond': '💎',
        'Platinum': '⚪',
        'Gold': '🥇',
        'Silver': '🥈',
        'Bronze': '🥉',
    }[rank] || '🏅');

    const ranked = players.map((p, i) => ({ ...p, rank: assignRank(i) }));
    const topThree = ranked.slice(0, 3);
    const restOfPlayers = ranked.slice(3);

    const avgLevel = players.length > 0
        ? Math.floor(players.reduce((sum, p) => sum + p.level, 0) / players.length)
        : 0;

    const handlePlayerClick = useCallback((player) => setSelectedPlayer(player), []);
    const handleClose = useCallback(() => setSelectedPlayer(null), []);

    if (loadingInitial) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-violet-400 font-black text-sm uppercase tracking-widest animate-pulse">Loading</p>
                </div>
            </div>
        );
    }

    const fadeIn = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6';

    return (
        <div className="relative min-h-screen overflow-hidden">
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="/images/zone.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/50 to-slate-950/70 backdrop-blur-[2px]" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-2 h-2 bg-violet-500/40 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-[15%] w-3 h-3 bg-orange-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 left-[20%] w-2 h-2 bg-cyan-500/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[60%] right-[8%] w-2 h-2 bg-yellow-500/20 rounded-full animate-ping" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className={`relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl transition-all duration-700 ${fadeIn}`}>
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-gradient-to-b from-transparent via-orange-500 to-transparent rounded-full"></div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-violet-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                            Global Leaderboard
                        </h1>
                        <div className="w-1 h-8 bg-gradient-to-b from-transparent via-violet-500 to-transparent rounded-full"></div>
                    </div>
                    <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                        Compete with the best players and climb to the top! 🏆
                    </p>
                    <p className="text-gray-600 text-sm mt-1">Click any player to view their match history</p>
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl px-6 py-3 border border-orange-500/30 shadow-lg">
                            <div className="text-orange-400 font-bold text-sm">Total Players</div>
                            <div className="text-white text-2xl font-extrabold">{players.length}</div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl px-6 py-3 border border-cyan-500/30 shadow-lg">
                            <div className="text-cyan-400 font-bold text-sm">Avg Level</div>
                            <div className="text-white text-2xl font-extrabold">{avgLevel}</div>
                        </div>
                    </div>
                </div>

                {topThree.length > 0 && (
                    <div className="mb-12">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">👑 Champion</h2>
                            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {topThree[1] && (
                                <div className="md:order-1 order-2">
                                    <PodiumCard player={topThree[1]} position={2} getRankColor={getRankColor} getRankBadge={getRankBadge} onClick={handlePlayerClick} />
                                </div>
                            )}
                            {topThree[0] && (
                                <div className="md:order-2 order-1">
                                    <PodiumCard player={topThree[0]} position={1} getRankColor={getRankColor} getRankBadge={getRankBadge} isWinner onClick={handlePlayerClick} />
                                </div>
                            )}
                            {topThree[2] && (
                                <div className="md:order-3 order-3">
                                    <PodiumCard player={topThree[2]} position={3} getRankColor={getRankColor} getRankBadge={getRankBadge} onClick={handlePlayerClick} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {players.length > 0 && (
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-violet-500/30 overflow-hidden">
                            <div className="grid grid-cols-12 px-4 md:px-6 py-4 border-b border-slate-700/50 bg-slate-800/40">
                                <div className="col-span-1 text-gray-400 text-xs md:text-sm font-bold">#</div>
                                <div className="col-span-5 md:col-span-4 text-gray-400 text-xs md:text-sm font-bold">Player</div>
                                <div className="col-span-6 md:col-span-7 grid grid-cols-3 md:grid-cols-4 gap-2 text-gray-400 text-xs md:text-sm font-bold">
                                    <span className="hidden md:block">Rank</span>
                                    <span>XP</span>
                                    <span>Wins</span>
                                    <span>W/L</span>
                                </div>
                            </div>
                            {restOfPlayers.map((player, index) => {
                                const isLast = index === restOfPlayers.length - 1;
                                return (
                                    <PlayerRow
                                        key={player.id}
                                        player={player}
                                        position={index + 4}
                                        getRankColor={getRankColor}
                                        getRankBadge={getRankBadge}
                                        onClick={handlePlayerClick}
                                        ref={isLast ? lastPlayerRef : undefined}
                                    />
                                );
                            })}
                            {loading && (
                                <div className="text-center py-5 text-white/50 animate-pulse text-sm tracking-wide">
                                    Loading more players...
                                </div>
                            )}
                            {!hasMore && !loading && players.length > 3 && (
                                <div className="text-center py-5 text-gray-500 text-sm">
                                    You've reached the end of the leaderboard 🏁
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center mt-8 pb-8">
                            <Link
                                to="/home"
                                className="group relative overflow-hidden border-4 border-orange-500 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-4 px-8 font-bold rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base hover:scale-105 hover:shadow-[0_0_50px_rgba(249,115,22,0.6)]"
                            >
                                <span className="text-xl">←</span>
                                <span className="relative z-10">BACK TO USER DASHBOARD</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            </Link>
                        </div>
                    </div>
                )}

                {!loading && players.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🏒</div>
                        <p className="text-gray-400 text-xl font-bold">No players yet.</p>
                        <p className="text-gray-600 mt-2">Be the first to compete!</p>
                    </div>
                )}
            </div>

            <PlayerHistoryPanel player={selectedPlayer} onClose={handleClose} currentUserId={currentUserId} />
        </div>
    );
}

function PodiumCard({ player, position, getRankColor, getRankBadge, isWinner = false, onClick }) {
    const positionColors = {
        1: 'from-yellow-400 to-yellow-600',
        2: 'from-gray-300 to-gray-500',
        3: 'from-orange-400 to-orange-600',
    };
    const positionEmojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const borderColors = {
        1: 'border-yellow-500/60',
        2: 'border-gray-400/60',
        3: 'border-orange-500/60',
    };
    return (
        <div
            onClick={() => onClick(player)}
            className={'relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border-2 ' + borderColors[position] + ' shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] cursor-pointer ' + (isWinner ? 'md:-mt-4' : 'md:mt-8')}
        >
            <p className="absolute top-3 right-3 text-[9px] text-gray-600 font-semibold uppercase tracking-wider">tap for history</p>
            <div className="flex justify-center mb-4">
                <div className={'w-16 h-16 bg-gradient-to-br ' + positionColors[position] + ' rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-white/20'}>
                    {positionEmojis[position]}
                </div>
            </div>
            <div className="flex justify-center mb-4">
                <div className="relative">
                    <img
                        src={player.avatar}
                        alt={player.username}
                        className={'w-24 h-24 rounded-full object-cover border-4 ' + (isWinner ? 'border-yellow-400' : 'border-white/30') + ' shadow-xl'}
                        onError={e => { e.target.src = '/images/avatar.webp'; }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-4 border-slate-900 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{player.level}</span>
                    </div>
                </div>
            </div>
            <div className="text-center mb-4">
                <h3 className="text-white text-xl font-extrabold mb-1">{player.username}</h3>
                <div className={'inline-flex items-center gap-2 bg-gradient-to-r ' + getRankColor(player.rank) + ' bg-opacity-20 px-4 py-1 rounded-full border border-white/20'}>
                    <span className="text-lg">{getRankBadge(player.rank)}</span>
                    <span className="text-white text-sm font-bold">{player.rank}</span>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="text-center">
                    <div className="text-cyan-400 text-lg font-extrabold">{player.totalXp.toLocaleString()}</div>
                    <div className="text-gray-400 text-xs">Total XP</div>
                </div>
                <div className="text-center">
                    <div className="text-green-400 text-lg font-extrabold">{player.wins}</div>
                    <div className="text-gray-400 text-xs">Wins</div>
                </div>
                <div className="text-center">
                    <div className="text-violet-400 text-lg font-extrabold">{player.winRate}%</div>
                    <div className="text-gray-400 text-xs">Win Rate</div>
                </div>
            </div>
        </div>
    );
}

const PlayerRow = forwardRef(function PlayerRow({ player, position, getRankColor, getRankBadge, onClick }, ref) {
    return (
        <div
            ref={ref}
            onClick={() => onClick(player)}
            className="group grid grid-cols-12 px-4 md:px-6 py-4 items-center border-b border-slate-800/50 hover:bg-violet-500/10 transition-all duration-300 cursor-pointer"
        >
            <div className="col-span-1">
                <div className="text-lg md:text-xl font-extrabold text-violet-400 group-hover:text-orange-400 transition-colors">
                    #{position}
                </div>
            </div>
            <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                <div className="relative flex-shrink-0">
                    <img
                        src={player.avatar}
                        alt={player.username}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-violet-500/40 shadow-lg group-hover:border-orange-500/60 transition-all"
                        onError={e => { e.target.src = '/images/avatar.webp'; }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{player.level}</span>
                    </div>
                </div>
                <div className="min-w-0">
                    <div className="text-white font-bold text-sm md:text-base truncate group-hover:text-orange-300 transition-colors">{player.username}</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs">{getRankBadge(player.rank)}</span>
                        <span className="text-gray-400 text-xs">{player.rank}</span>
                    </div>
                </div>
            </div>
            <div className="col-span-6 md:col-span-7 grid grid-cols-3 md:grid-cols-4 gap-2 text-xs md:text-sm">
                <div className="hidden md:flex items-center">
                    <div className={'bg-gradient-to-r ' + getRankColor(player.rank) + ' bg-opacity-20 px-3 py-1 rounded-full border border-white/20 text-white font-bold text-xs'}>
                        {player.rank}
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 md:px-3 py-1 rounded-full font-bold">
                        {player.totalXp.toLocaleString()}
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="bg-green-500/20 text-green-300 border border-green-500/40 px-2 md:px-3 py-1 rounded-full font-bold">
                        {player.wins}W
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-violet-500/20 text-violet-300 border border-violet-500/40 px-2 md:px-3 py-1 rounded-full font-bold">
                        {player.winRate}%
                    </div>
                    <span className="hidden md:block text-[10px] text-gray-700 group-hover:text-gray-500 transition-colors font-semibold">
                        history →
                    </span>
                </div>
            </div>
        </div>
    );
});