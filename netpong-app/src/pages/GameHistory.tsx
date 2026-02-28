import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';

type GameResult = 'WIN' | 'LOSS';

interface HistoryEntry {
    id: string;
    createdAt: string;
    mode: string;
    result: GameResult;
    myScore: number;
    opponentScore: number;
    opponentType: string;
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

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function Avatar({
    src,
    name,
    className,
    fallbackClass,
}: {
    src?: string | null;
    name: string;
    className: string;
    fallbackClass: string;
}) {
    const [errored, setErrored] = useState(false);
    const initial = (name || '?').charAt(0).toUpperCase();

    if (!src || errored) {
        return (
            <div className={`${className} ${fallbackClass} flex items-center justify-center font-black text-white`}>
                {initial}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            className={`${className} object-cover`}
            onError={() => setErrored(true)}
        />
    );
}

export default function GameHistory() {
    const navigate = useNavigate();
    const [player, setPlayer] = useState<PlayerInfo | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
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
                if (!profileRes.ok || !historyRes.ok) { navigate('/login'); return; }
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
            // silent
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

    if (error || !player) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-red-400 font-black text-xl">{error ?? 'Something went wrong'}</p>
            </div>
        );
    }

    const filtered = filter === 'ALL' ? history : history.filter(h => h.result === filter);
    const totalXpEarned = history.reduce((s, h) => s + (h.xpEarned ?? 0), 0);
    const xpProgress = Math.min((player.points / (player.level * 100)) * 100, 100);
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
                        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,1) 2px,rgba(255,255,255,1) 3px)',
                        backgroundSize: '100% 3px',
                    }}
                />
            </div>

            <div className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">

                {/* Header */}
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

                {/* Player card */}
                <div className={`mb-6 transition-all duration-700 delay-100 ${fadeIn}`}>
                    <div
                        className="relative rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl"
                        style={{ background: 'rgba(15,15,20,0.75)', boxShadow: '0 0 40px rgba(251,146,60,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />
                        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">

                            {/* Avatar + name */}
                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="relative">
                                    <Avatar
                                        src={player.avatarUrl}
                                        name={player.username}
                                        className="w-16 h-16 rounded-2xl ring-2 ring-orange-500/50"
                                        fallbackClass="bg-gradient-to-br from-orange-500 to-red-600 text-xl"
                                    />
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

                            {/* XP bar */}
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
                                <p className="text-[10px] text-gray-600 mt-1">{player.points} / {player.level * 100} XP to next level</p>
                            </div>

                            <div className="hidden sm:block w-px h-12 bg-white/10" />

                            {/* Wins / Losses — from player object directly */}
                            <div className="flex gap-6 flex-shrink-0">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-emerald-400">{player.wins}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wins</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-red-400">{player.losses}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Losses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter row */}
                <div className={`mb-4 flex items-center gap-2 flex-wrap transition-all duration-700 delay-200 ${fadeIn}`}>
                    {(['ALL', 'WIN', 'LOSS'] as const).map(f => {
                        const isActive = filter === f;
                        let cls = 'px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all duration-200 ';
                        if (isActive) {
                            if (f === 'ALL') cls += 'bg-white/15 border-white/30 text-white';
                            else if (f === 'WIN') cls += 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
                            else cls += 'bg-red-500/20 border-red-500/50 text-red-400';
                        } else {
                            cls += 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20';
                        }
                        const label = f === 'ALL'
                            ? `All (${history.length})`
                            : f === 'WIN'
                                ? `Wins (${history.filter(h => h.result === 'WIN').length})`
                                : `Losses (${history.filter(h => h.result === 'LOSS').length})`;
                        return (
                            <button key={f} onClick={() => setFilter(f)} className={cls}>{label}</button>
                        );
                    })}
                    <div className="ml-auto text-xs text-gray-600 font-semibold">+{totalXpEarned} XP earned total</div>
                </div>

                {/* Table */}
                <div className={`transition-all duration-700 delay-300 ${fadeIn}`}>
                    <div
                        className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-xl"
                        style={{ background: 'rgba(10,10,15,0.80)', boxShadow: '0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' }}
                    >
                        {/* Table header */}
                        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)] gap-2 px-5 py-3 border-b border-white/5">
                            {['Match', 'Mode', 'Score', 'Result', 'XP'].map(h => (
                                <p key={h} className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-600">{h}</p>
                            ))}
                        </div>

                        {filtered.length === 0 && !loadingMore && (
                            <div className="py-16 text-center text-gray-600 font-semibold text-sm">No matches found</div>
                        )}

                        {filtered.map((entry, i) => {
                            const isLast = i === filtered.length - 1;
                            const mode = MODE_CONFIG[entry.mode] ?? DEFAULT_MODE;
                            const isWin = entry.result === 'WIN';

                            return (
                                <div
                                    key={entry.id}
                                    ref={isLast ? lastRowRef : undefined}
                                    className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)] gap-2 px-5 py-3 items-center border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors duration-150"
                                >
                                    {/* Match: my avatar VS opponent avatar + names */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Avatar
                                                src={player.avatarUrl}
                                                name={player.username}
                                                className="w-8 h-8 rounded-full ring-2 ring-orange-500"
                                                fallbackClass="bg-gradient-to-br from-orange-500 to-red-600 text-xs"
                                            />
                                            <span className="text-[8px] font-black text-gray-600 px-0.5">VS</span>
                                            <Avatar
                                                src={entry.opponentAvatarUrl}
                                                name={entry.opponentName}
                                                className="w-8 h-8 rounded-full ring-2 ring-slate-500"
                                                fallbackClass="bg-gradient-to-br from-slate-500 to-slate-700 text-xs"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold text-xs truncate">
                                                {player.username} <span className="text-orange-400 font-black">(You)</span>
                                            </p>
                                            <p className="text-gray-500 text-[11px] truncate">{entry.opponentName}</p>
                                        </div>
                                    </div>

                                    {/* Mode */}
                                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${mode.bg} ${mode.border} w-fit`}>
                                        <span className="text-sm leading-none">{mode.icon}</span>
                                        <span className={`text-[11px] font-bold ${mode.color} hidden sm:block`}>{mode.label}</span>
                                    </div>

                                    {/* Score */}
                                    <div>
                                        <p className="text-white font-black text-sm tabular-nums">
                                            <span className="text-orange-400">{entry.myScore}</span>
                                            <span className="text-gray-600 mx-0.5">:</span>
                                            <span className="text-gray-400">{entry.opponentScore}</span>
                                        </p>
                                        <p className="text-[9px] text-gray-600">{formatDate(entry.createdAt)}</p>
                                    </div>

                                    {/* Result */}
                                    <div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide ${isWin ? 'text-emerald-400 bg-emerald-500/15' : 'text-red-400 bg-red-500/15'}`}>
                                            {isWin ? '🏆' : '💀'} {isWin ? 'Victory' : 'Defeat'}
                                        </span>
                                    </div>

                                    {/* XP */}
                                    <div>
                                        <p className={`text-sm font-black ${isWin ? 'text-orange-400' : 'text-gray-600'}`}>+{entry.xpEarned ?? 0}</p>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-wider">XP</p>
                                    </div>
                                </div>
                            );
                        })}

                        {loadingMore && (
                            <div className="py-5 text-center text-orange-400/60 animate-pulse text-sm font-bold">Loading more...</div>
                        )}

                        {!hasMore && !loadingMore && history.length > 0 && (
                            <div className="py-4 text-center text-gray-600 text-xs font-semibold">All matches loaded 🏁</div>
                        )}

                        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                            <p className="text-xs text-gray-600 font-semibold">{filtered.length} match{filtered.length !== 1 ? 'es' : ''}</p>
                            <p className="text-xs text-gray-700 font-semibold">Most recent first</p>
                        </div>
                    </div>
                </div>

                <div className="h-8" />
            </div>
        </div>
    );
}
