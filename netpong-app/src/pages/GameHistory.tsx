import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';

type GameResult = 'WIN' | 'LOSS';
type GameMode = 'ZOMBIE_LAND' | 'SOUL_SOCIETY' | 'KITTY_CAT' | 'JOKER';
type OpponentType = 'PLAYER' | 'AI';

interface HistoryEntry {
    id: string;
    createdAt: string;
    mode: GameMode;
    result: GameResult;
    myScore: number;
    opponentScore: number;
    opponentType: OpponentType;
    opponentName: string;
    opponentAvatarUrl?: string | null;
    xpEarned: number;
}

interface PlayerInfo {
    id: string;
    username: string;
    avatarUrl?: string | null;
    totalXp: number;
    level: number;
    points: number;
    wins: number;
    losses: number;
}

const LIMIT = 20;

const MODE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
    ZOMBIE_LAND: { label: 'Zombie Land', icon: '🧟', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    SOUL_SOCIETY: { label: 'Soul Society', icon: '⚔️', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    KITTY_CAT: { label: 'Kitty Cat', icon: '🐱', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
    JOKER: { label: 'Joker', icon: '🃏', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
};

const DEFAULT_MODE = { label: 'Unknown', icon: '🎮', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' };

const RESULT_CONFIG: Record<string, { label: string; color: string; bg: string; glow: string }> = {
    WIN: { label: 'Victory', color: 'text-emerald-400', bg: 'bg-emerald-500/15', glow: 'shadow-emerald-500/20' },
    LOSS: { label: 'Defeat', color: 'text-red-400', bg: 'bg-red-500/15', glow: 'shadow-red-500/20' },
};

const DEFAULT_RESULT = { label: 'Unknown', color: 'text-gray-400', bg: 'bg-gray-500/15', glow: 'shadow-gray-500/20' };

function getFilterActiveClass(f: 'ALL' | GameResult): string {
    if (f === 'ALL') return 'bg-white/15 border-white/30 text-white';
    if (f === 'WIN') return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
    return 'bg-red-500/20 border-red-500/50 text-red-400';
}

function getFilterLabel(f: 'ALL' | GameResult, total: number, wins: number, losses: number): string {
    if (f === 'ALL') return `All (${total})`;
    if (f === 'WIN') return `Wins (${wins})`;
    return `Losses (${losses})`;
}

function getResultEmoji(result: string): string {
    return result === 'WIN' ? '🏆' : '💀';
}

function getXpColor(result: string): string {
    return result === 'WIN' ? 'text-orange-400' : 'text-gray-600';
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function PlayerAvatar({ src, name, isMe }: { src?: string | null; name: string; isMe: boolean }) {
    const [errored, setErrored] = useState(false);
    const initial = (name ?? '?').charAt(0).toUpperCase();
    const ringColor = isMe ? 'ring-orange-500' : 'ring-slate-500';
    const fallbackGradient = isMe ? 'from-orange-500 to-red-600' : 'from-slate-500 to-slate-700';
    const showFallback = !src || errored;

    return (
        <div className={`w-10 h-10 rounded-full ring-2 ${ringColor} flex-shrink-0 overflow-hidden`}>
            {showFallback ? (
                <div className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center`}>
                    <span className="text-white text-sm font-black">{initial}</span>
                </div>
            ) : (
                <img
                    src={src!}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setErrored(true)}
                />
            )}
        </div>
    );
}

export default function GameHistory() {
    const navigate = useNavigate();
    const [player, setPlayer] = useState<PlayerInfo | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | GameResult>('ALL');
    const [visible, setVisible] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const pageRef = useRef(1);

    useEffect(() => {
        document.title = 'Game History - NetPong';
        const t = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const [profileRes, historyRes] = await Promise.all([
                    authFetch('/api/auth/me', { method: 'GET' }),
                    authFetch(`/api/game/history?page=1&limit=${LIMIT}`, { method: 'GET' }),
                ]);

                if (!profileRes.ok || !historyRes.ok) {
                    navigate('/login');
                    return;
                }

                const profileData: PlayerInfo = await profileRes.json();
                const historyData: HistoryEntry[] = await historyRes.json();

                setPlayer(profileData);
                setHistory(historyData);
                setHasMore(historyData.length === LIMIT);
                pageRef.current = 1;
            } catch {
                setError('Failed to load data');
            } finally {
                setLoadingInitial(false);
            }
        };

        init();
    }, []);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = pageRef.current + 1;

        try {
            const res = await authFetch(`/api/game/history?page=${nextPage}&limit=${LIMIT}`, { method: 'GET' });
            if (!res.ok) return;
            const data: HistoryEntry[] = await res.json();
            setHistory(prev => [...prev, ...data]);
            setHasMore(data.length === LIMIT);
            pageRef.current = nextPage;
        } catch {
            // silently fail on pagination errors
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore]);

    const lastRowRef = useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) observerRef.current.disconnect();
        if (!node) return;
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) loadMore();
        }, { threshold: 0.1 });
        observerRef.current.observe(node);
    }, [loadMore]);

    if (loadingInitial) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-orange-400 font-black text-xl animate-pulse">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-red-400 font-black text-xl">{error}</p>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-red-400 font-black text-xl">Something went wrong</p>
            </div>
        );
    }

    const filtered = filter === 'ALL' ? history : history.filter(h => h.result === filter);
    const wins = history.filter(h => h.result === 'WIN').length;
    const losses = history.filter(h => h.result === 'LOSS').length;
    const totalXpEarned = history.reduce((s, h) => s + (h.xpEarned ?? 0), 0);

    const xpInLevel = player.points;
    const xpNeeded = player.level * 100;
    const xpProgress = Math.min((xpInLevel / xpNeeded) * 100, 100);

    const fadeIn = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

    return (
        <div className="relative min-h-screen bg-black font-[system-ui]">

            <div className="fixed inset-0 z-0">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90">
                    <source src="/images/history.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.08)_0%,transparent_60%)]" />
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)',
                        backgroundSize: '100% 3px',
                    }}
                />
            </div>

            <div className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">

                <div className={`mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-orange-400 text-xs font-black uppercase tracking-[0.3em] mb-1">NetPong</p>
                            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                                Battle <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">History</span>
                            </h1>
                        </div>
                        <button
                            onClick={() => navigate('/home')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white text-sm font-semibold transition-all duration-200"
                        >
                            ← Back
                        </button>
                    </div>
                </div>

                <div className={`mb-6 transition-all duration-700 delay-100 ${fadeIn}`}>
                    <div
                        className="relative rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl"
                        style={{
                            background: 'rgba(15,15,20,0.75)',
                            boxShadow: '0 0 40px rgba(251,146,60,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />
                        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">

                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/20">
                                        <PlayerAvatar src={player.avatarUrl} name={player.username} isMe={true} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full px-1.5 py-0.5 text-[9px] font-black text-black leading-none">
                                        LV{player.level}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-white font-black text-xl tracking-tight">{player.username}</p>
                                    <p className="text-orange-400 text-xs font-bold tracking-widest uppercase">Level {player.level} Player</p>
                                </div>
                            </div>

                            <div className="hidden sm:block w-px h-12 bg-white/10" />

                            <div className="flex-1 w-full sm:w-auto">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Experience</span>
                                    <span className="text-xs font-black text-orange-400">{player.totalXp.toLocaleString()} XP</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-1000"
                                        style={{ width: `${xpProgress}%`, boxShadow: '0 0 8px rgba(251,146,60,0.6)' }}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-600 mt-1">{xpInLevel} / {xpNeeded} XP to next level</p>
                            </div>

                            <div className="hidden sm:block w-px h-12 bg-white/10" />

                            <div className="flex gap-4 sm:gap-6">
                                {[
                                    { label: 'Wins', val: wins, color: 'text-emerald-400' },
                                    { label: 'Losses', val: losses, color: 'text-red-400' },
                                ].map(s => (
                                    <div key={s.label} className="text-center">
                                        <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`mb-4 flex items-center gap-2 flex-wrap transition-all duration-700 delay-200 ${fadeIn}`}>
                    {(['ALL', 'WIN', 'LOSS'] as const).map(f => {
                        let btnClass = 'px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all duration-200 ';
                        btnClass += filter === f
                            ? getFilterActiveClass(f)
                            : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20';
                        return (
                            <button key={f} onClick={() => setFilter(f)} className={btnClass}>
                                {getFilterLabel(f, history.length, wins, losses)}
                            </button>
                        );
                    })}
                    <div className="ml-auto text-xs text-gray-600 font-semibold">
                        +{totalXpEarned} XP earned total
                    </div>
                </div>

                <div className={`transition-all duration-700 delay-300 ${fadeIn}`}>
                    <div
                        className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl"
                        style={{
                            background: 'rgba(10,10,15,0.80)',
                            boxShadow: '0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                        }}
                    >
                        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-3 px-5 py-3 border-b border-white/5">
                            {['Match', 'Game Mode', 'Score', 'Result', 'XP'].map(h => (
                                <p key={h} className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-600">{h}</p>
                            ))}
                        </div>

                        {filtered.length === 0 && !loadingMore && (
                            <div className="py-16 text-center text-gray-600 font-semibold text-sm">
                                No matches found
                            </div>
                        )}

                        {filtered.map((entry, i) => {
                            const isLast = i === filtered.length - 1;
                            const mode = MODE_CONFIG[entry.mode] ?? DEFAULT_MODE;
                            const result = RESULT_CONFIG[entry.result] ?? DEFAULT_RESULT;
                            const resultEmoji = getResultEmoji(entry.result);
                            const xpColor = getXpColor(entry.result);

                            return (
                                <div
                                    key={entry.id}
                                    ref={isLast ? lastRowRef : undefined}
                                    className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-3 px-5 py-4 items-center border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-150"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <PlayerAvatar src={player.avatarUrl} name={player.username} isMe={true} />
                                            <span className="text-[9px] font-black text-gray-600">VS</span>
                                            <PlayerAvatar src={entry.opponentAvatarUrl} name={entry.opponentName ?? '?'} isMe={false} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-sm truncate leading-tight">{player.username}</p>
                                            <p className="text-gray-500 text-xs truncate leading-tight">{entry.opponentName}</p>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${mode.bg} ${mode.border} w-fit`}>
                                        <span className="text-base leading-none">{mode.icon}</span>
                                        <span className={`text-xs font-bold ${mode.color} hidden sm:block`}>{mode.label}</span>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-white font-black text-base tabular-nums">
                                            <span className="text-orange-400">{entry.myScore}</span>
                                            <span className="text-gray-600 mx-0.5">:</span>
                                            <span className="text-gray-400">{entry.opponentScore}</span>
                                        </p>
                                        <p className="text-[9px] text-gray-600 font-semibold">{formatDate(entry.createdAt)}</p>
                                    </div>

                                    <div className="flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${result.color} ${result.bg} shadow-lg ${result.glow}`}>
                                            {resultEmoji} {result.label}
                                        </span>
                                    </div>

                                    <div className="text-center">
                                        <p className={`text-sm font-black ${xpColor}`}>+{entry.xpEarned ?? 0}</p>
                                        <p className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">XP</p>
                                    </div>
                                </div>
                            );
                        })}

                        {loadingMore && (
                            <div className="py-5 text-center text-orange-400/60 animate-pulse text-sm font-bold tracking-wide">
                                Loading more...
                            </div>
                        )}

                        {!hasMore && !loadingMore && history.length > 0 && (
                            <div className="py-5 text-center text-gray-600 text-xs font-semibold">
                                All matches loaded 🏁
                            </div>
                        )}

                        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                            <p className="text-xs text-gray-600 font-semibold">
                                {filtered.length} match{filtered.length !== 1 ? 'es' : ''}
                            </p>
                            <p className="text-xs text-gray-700 font-semibold">Showing most recent first</p>
                        </div>
                    </div>
                </div>

                <div className="h-8" />
            </div>
        </div>
    );
}
