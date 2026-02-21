import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';
import { getFriends, sendFriendRequest } from '../utils/userService';
import { getGameSocket, disconnectGameSocket } from '../utils/gameSocket';
import AirHockeyCanvas from '../game/AirHockeyCanvas';
import { getUserById } from '../utils/getUserById';

type BackendGameMode = 'SOUL_SOCIETY' | 'ZOMBIE_LAND' | 'BARBIE_PINK' | 'JOKER';

type Screen =
    | 'MODE_SELECT'
    | 'IN_QUEUE'
    | 'READY_CHECK'
    | 'IN_GAME'
    | 'GAME_OVER'
    | 'GAME_ABORTED';

interface GameOverData {
    winnerId: string;
    score: { left: number; right: number };
}

interface GameAbortedData {
    reason: string;
}

interface UserProfile {
    id: string;
    username: string;
    avatarUrl?: string | null;
}

export default function GamePlay() {
    const navigate = useNavigate();
    const socketRef = useRef<Socket | null>(null);

    const [screen, setScreen] = useState<Screen>('MODE_SELECT');
    const [side, setSide] = useState<'left' | 'right'>('left');

    const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
    const [myAvatarSrc, setMyAvatarSrc] = useState('/images/default-avatar.png');

    const [opponentUser, setOpponentUser] = useState<UserProfile | null>(null);
    const [opponentAvatarSrc, setOpponentAvatarSrc] = useState('/images/default-avatar.png');
    const [opponentStats, setOpponentStats] = useState<{ total: number; wins: number; losses: number; winRate: number } | null>(null);
    const [isFriend, setIsFriend] = useState<boolean | null>(null);

    const [playerStats, setPlayerStats] = useState<{ total: number; wins: number; losses: number; winRate: number } | null>(null);
    const [friendsIds, setFriendsIds] = useState<string[]>([]);
    const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
    const [abortData, setAbortData] = useState<GameAbortedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);

    // ---------------------------------------------------------------------------
    // Lock page scroll entirely — arrow keys won't move the page
    // ---------------------------------------------------------------------------
    useEffect(() => {
        // Prevent the page from scrolling at all
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.documentElement.style.height = '100%';

        // Prevent arrow keys + spacebar from scrolling the page
        const preventScrollKeys = (e: KeyboardEvent) => {
            const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
            if (scrollKeys.includes(e.key)) {
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', preventScrollKeys, { passive: false });

        return () => {
            // Restore scroll when leaving the page
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.height = '';
            window.removeEventListener('keydown', preventScrollKeys);
        };
    }, []);

    // ---------------------------------------------------------------------------
    // Page title / favicon
    // ---------------------------------------------------------------------------
    useEffect(() => {
        document.title = 'Zombie Land - NetGame';
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
        if (link) link.href = '/zombie.svg';
        return () => {
            document.title = 'NetPong';
            if (link) link.href = '/netpong.svg';
        };
    }, []);

    // ---------------------------------------------------------------------------
    // Fetch MY profile
    // ---------------------------------------------------------------------------
    useEffect(() => {
        authFetch('/api/auth/me', { method: 'GET' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                setMyProfile({ id: data.id, username: data.username, avatarUrl: data.avatarUrl });
                setMyAvatarSrc(data.avatarUrl || '/images/default-avatar.png');
            })
            .catch(() => {});
    }, []);

    // ---------------------------------------------------------------------------
    // Load player stats and friends once
    // ---------------------------------------------------------------------------
    useEffect(() => {
        (async () => {
            try {
                const statsRes = await authFetch('/api/game/stats', { method: 'GET' });
                if (statsRes.ok) setPlayerStats(await statsRes.json());
            } catch (e) {}

            try {
                const friends = await getFriends();
                setFriendsIds(friends.map((f: any) => f.id));
            } catch (e) {
                setFriendsIds([]);
            }
        })();
    }, []);

    // Refresh my stats after game ends
    useEffect(() => {
        if (screen === 'GAME_OVER' || screen === 'GAME_ABORTED') {
            authFetch('/api/game/stats', { method: 'GET' })
                .then(r => r.ok ? r.json() : null)
                .then(stats => { if (stats) setPlayerStats(stats); })
                .catch(() => {});
        }
    }, [screen]);

    // ---------------------------------------------------------------------------
    // Socket setup
    // ---------------------------------------------------------------------------
    useEffect(() => {
        let isMounted = true;

        (async () => {
            const socket = await getGameSocket();
            if (!socket || !isMounted) {
                if (!socket) navigate('/login');
                return;
            }

            socketRef.current = socket;

            socket.on('connect', () => {
                if (!isMounted) return;
                setError(null);
            });

            socket.on('connect_error', () => {
                if (!isMounted) return;
                setError('Could not connect to game server. Please try again.');
            });

            socket.on('gameFound', async (data: {
                gameId: string;
                side: 'left' | 'right';
                mode: BackendGameMode;
                opponentId: string;
            }) => {
                if (!isMounted) return;
                setSide(data.side);

                try {
                    const oppUser = await getUserById(data.opponentId);
                    setOpponentUser({ id: data.opponentId, username: oppUser.username, avatarUrl: oppUser.avatarUrl });
                    setOpponentAvatarSrc(oppUser.avatarUrl || '/images/default-avatar.png');
                    setIsFriend(friendsIds.includes(data.opponentId));
                } catch {
                    setOpponentUser({ id: data.opponentId, username: 'Opponent', avatarUrl: null });
                    setOpponentAvatarSrc('/images/default-avatar.png');
                    setIsFriend(null);
                }

                try {
                    const statsRes = await authFetch(`/api/game/stats/${data.opponentId}`, { method: 'GET' });
                    if (statsRes.ok) setOpponentStats(await statsRes.json());
                    else setOpponentStats(null);
                } catch {
                    setOpponentStats(null);
                }

                setScreen('READY_CHECK');
            });

            socket.on('gameAborted', (data: GameAbortedData) => {
                if (!isMounted) return;
                setAbortData(data);
                setScreen('GAME_ABORTED');
            });
        })();

        return () => {
            isMounted = false;
            disconnectGameSocket();
            socketRef.current = null;
        };
    }, [navigate]);

    // ---------------------------------------------------------------------------
    // Derived values
    // ---------------------------------------------------------------------------
    const myName = myProfile?.username ? `${myProfile.username} (You)` : 'You';
    const myScore = gameOverData ? (side === 'left' ? gameOverData.score.left : gameOverData.score.right) : 0;
    const opponentScore = gameOverData ? (side === 'left' ? gameOverData.score.right : gameOverData.score.left) : 0;
    const iWon = !!myProfile && gameOverData?.winnerId === myProfile.id;

    // ---------------------------------------------------------------------------
    // Actions
    // ---------------------------------------------------------------------------
    const joinQueue = useCallback(() => {
        if (!socketRef.current) {
            setError('Could not connect to game server. Please try again.');
            return;
        }
        socketRef.current.emit('joinQueue', { mode: 'ZOMBIE_LAND' as BackendGameMode });
        setScreen('IN_QUEUE');
    }, []);

    const leaveQueue = useCallback(() => {
        socketRef.current?.emit('leaveQueue');
        setScreen('MODE_SELECT');
        setOpponentUser(null);
    }, []);

    const confirmReady = useCallback(() => {
        socketRef.current?.emit('setReady');
        setScreen('IN_GAME');
    }, []);

    const handleGameOver = useCallback((data: GameOverData) => {
        setGameOverData(data);
        setScreen('GAME_OVER');
    }, []);

    const handleGameAborted = useCallback((data: GameAbortedData) => {
        setAbortData(data);
        setScreen('GAME_ABORTED');
    }, []);

    const playAgain = useCallback(() => {
        setGameOverData(null);
        setAbortData(null);
        setOpponentUser(null);
        setOpponentStats(null);
        setOpponentAvatarSrc('/images/default-avatar.png');
        setIsFriend(null);
        setProfileError(null);
        setScreen('MODE_SELECT');
    }, []);

    const exitGame = useCallback(() => {
        try { socketRef.current?.emit('forfeit'); } catch (e) {}
        navigate('/');
    }, [navigate]);

    useEffect(() => {
        const onBeforeUnload = () => {
            try {
                if (socketRef.current && screen === 'IN_GAME')
                    socketRef.current.emit('forfeit');
            } catch (e) {}
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [screen]);

    const handleAddFriend = useCallback(async () => {
        if (!opponentUser || isFriend) return;
        try {
            await sendFriendRequest(opponentUser.username);
            setIsFriend(true);
        } catch (e: any) {
            setProfileError(e?.message || 'Failed to send friend request');
        }
    }, [opponentUser, isFriend]);

    // ---------------------------------------------------------------------------
    // Profile cards
    // ---------------------------------------------------------------------------
    const MyCard = (
        <div className="flex items-center gap-4">
            <div className="relative">
                <img
                    src={myAvatarSrc}
                    alt={myName}
                    className="w-16 h-16 rounded-full border-4 border-green-400 shadow-lg object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900" />
            </div>
            <div className="flex flex-col">
                <span className="text-white font-bold text-lg">{myName}</span>
                {playerStats && (
                    <div className="mt-1 flex flex-col text-xs text-green-200">
                        <span>Games: <span className="font-semibold text-white">{playerStats.total}</span></span>
                        <span>Wins: <span className="font-semibold text-green-400">{playerStats.wins}</span></span>
                        <span>Losses: <span className="font-semibold text-red-400">{playerStats.losses}</span></span>
                        <span>Win Rate: <span className="font-semibold text-yellow-300">{playerStats.winRate}%</span></span>
                    </div>
                )}
            </div>
        </div>
    );

    const OppCard = opponentUser ? (
        <div className="flex items-center gap-4">
            <div className="relative">
                <img
                    src={opponentAvatarSrc}
                    alt={opponentUser.username}
                    className="w-16 h-16 rounded-full border-4 border-red-400 shadow-lg object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-slate-900" />
            </div>
            <div className="flex flex-col">
                <span className="text-red-200 font-bold text-lg">{opponentUser.username}</span>
                {opponentStats ? (
                    <div className="mt-1 flex flex-col text-xs text-red-200">
                        <span>Games: <span className="font-semibold text-white">{opponentStats.total}</span></span>
                        <span>Wins: <span className="font-semibold text-green-400">{opponentStats.wins}</span></span>
                        <span>Losses: <span className="font-semibold text-red-400">{opponentStats.losses}</span></span>
                        <span>Win Rate: <span className="font-semibold text-yellow-300">{opponentStats.winRate}%</span></span>
                    </div>
                ) : (
                    <span className="mt-1 text-xs text-red-300 animate-pulse">Loading stats...</span>
                )}
                {isFriend === true && (
                    <span className="text-xs text-green-400 font-semibold mt-1">✓ Friend</span>
                )}
            </div>
        </div>
    ) : null;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        // overflow-hidden on the root + fixed height = no scroll ever
        <div className="relative h-[100svh] overflow-hidden">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                <source src="/images/zombie.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 gap-4 sm:gap-6 overflow-hidden">

                {/* Title */}
                <div className="text-center space-y-2">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 drop-shadow-[0_0_40px_rgba(34,197,94,0.8)] animate-pulse">
                        ZOMBIE LAND
                    </h1>
                    <p className="text-green-400 text-lg md:text-xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]">
                        SURVIVE THE APOCALYPSE
                    </p>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="bg-red-900/80 border border-red-500 text-red-200 rounded-xl px-6 py-3 text-sm font-semibold">
                        ⚠️ {error}
                    </div>
                )}

                {/* ── MODE SELECT ── */}
                {screen === 'MODE_SELECT' && (
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
                        <h2 className="text-green-300 font-bold text-2xl">Zombie Land</h2>
                        <p className="text-green-200 text-sm">Survive the apocalypse!</p>
                        <button
                            onClick={joinQueue}
                            className="group relative w-full bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 text-white py-4 px-8 font-bold rounded-xl shadow-2xl shadow-green-500/40 transition-all duration-300 text-lg hover:scale-105 border-2 border-green-400/50 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span>🎮 FIND MATCH</span>
                        </button>
                        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm transition-colors">
                            ← Back
                        </button>
                    </div>
                )}

                {/* ── IN QUEUE ── */}
                {screen === 'IN_QUEUE' && (
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-green-500/30 rounded-3xl p-10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
                        <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                        <p className="text-green-300 font-bold text-xl">Searching for opponent…</p>
                        <p className="text-gray-400 text-sm">Mode: Zombie Land</p>
                        <button
                            onClick={leaveQueue}
                            className="mt-2 text-red-400 hover:text-red-300 text-sm font-semibold border border-red-500/40 rounded-lg px-4 py-2 hover:bg-red-900/30 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* ── READY CHECK ── */}
                {screen === 'READY_CHECK' && (
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-yellow-500/40 rounded-3xl p-10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
                        <div className="text-5xl animate-pulse">⚡</div>
                        <p className="text-yellow-300 font-extrabold text-2xl">Opponent Found!</p>
                        <p className="text-gray-300 text-sm">
                            You are on the <span className={`font-bold ${side === 'left' ? 'text-green-400' : 'text-red-400'}`}>{side.toUpperCase()}</span> side
                        </p>
                        {opponentUser && (
                            <div className="flex items-center gap-3 bg-slate-800/60 rounded-2xl px-4 py-3">
                                <img
                                    src={opponentAvatarSrc}
                                    alt={opponentUser.username}
                                    className="w-10 h-10 rounded-full border-2 border-red-400 object-cover"
                                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
                                />
                                <span className="text-gray-200 text-sm">vs <span className="font-bold text-white">{opponentUser.username}</span></span>
                            </div>
                        )}
                        <p className="text-gray-400 text-xs text-center">Both players must confirm ready within 30 seconds</p>
                        <button
                            onClick={confirmReady}
                            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-extrabold py-4 rounded-xl shadow-lg shadow-yellow-500/40 hover:scale-105 transition-all duration-200 text-lg"
                        >
                            ✅ I'M READY
                        </button>
                    </div>
                )}

                {/* ── IN GAME ── */}
                {screen === 'IN_GAME' && socketRef.current && (
                    <div className="relative w-full max-w-5xl flex flex-col gap-3">
                        {opponentUser && (
                            <div className="w-full bg-gradient-to-r from-green-900/80 via-slate-900/80 to-green-900/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
                                {side === 'left' ? MyCard : OppCard}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <span className="text-2xl font-extrabold text-green-400">VS</span>
                                    <span className="text-xs font-bold text-green-300 mt-1">Zombie Land</span>
                                </div>
                                {side === 'left' ? OppCard : MyCard}
                            </div>
                        )}

                        <div className="aspect-video min-h-[250px] sm:min-h-[350px] md:min-h-[450px] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.4)] border-4 border-green-500/30">
                            <AirHockeyCanvas
                                side={side}
                                socket={socketRef.current}
                                onGameOver={handleGameOver}
                                onGameAborted={handleGameAborted}
                            />
                        </div>

                        <button
                            onClick={exitGame}
                            className="w-full bg-red-950/70 hover:bg-red-900/80 border border-red-700/50 text-red-400 hover:text-red-300 font-bold py-3 rounded-xl transition-all text-sm tracking-wide flex items-center justify-center gap-2"
                        >
                            🚪 <span>Exit Arena</span> <span className="text-xs text-red-500 font-normal">(opponent wins)</span>
                        </button>
                    </div>
                )}

                {/* ── GAME OVER ── */}
                {screen === 'GAME_OVER' && gameOverData && (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-green-500/40 rounded-3xl p-10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
                        <div className="text-7xl">{iWon ? '🏆' : '💀'}</div>
                        <h2 className={`text-4xl font-extrabold ${iWon ? 'text-green-400' : 'text-red-400'}`}>
                            {iWon ? 'Victory!' : 'Defeated!'}
                        </h2>

                        <div className="w-full bg-slate-800/60 rounded-2xl p-4 flex items-center justify-around">
                            <div className="flex flex-col items-center gap-1">
                                <img
                                    src={myAvatarSrc}
                                    alt={myName}
                                    className="w-12 h-12 rounded-full border-2 border-green-400 object-cover"
                                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
                                />
                                <span className="text-sm font-bold text-white">{myName}</span>
                                <span className="text-3xl font-extrabold text-green-400">{myScore}</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-500">—</span>
                            <div className="flex flex-col items-center gap-1">
                                <img
                                    src={opponentAvatarSrc}
                                    alt={opponentUser?.username || 'Opponent'}
                                    className="w-12 h-12 rounded-full border-2 border-red-400 object-cover"
                                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
                                />
                                <span className="text-sm font-bold text-red-300">{opponentUser?.username || 'Opponent'}</span>
                                <span className="text-3xl font-extrabold text-red-400">{opponentScore}</span>
                            </div>
                        </div>

                        <button
                            onClick={playAgain}
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl hover:scale-105 transition-all shadow-lg shadow-green-500/30 text-lg"
                        >
                            🎮 Play Again
                        </button>
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white text-sm transition-colors">
                            ← Back to Lobby
                        </button>
                    </div>
                )}

                {/* ── GAME ABORTED ── */}
                {screen === 'GAME_ABORTED' && (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-red-800/60 rounded-3xl p-10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-7xl animate-bounce">☠️</div>
                            <h2 className="text-3xl font-extrabold text-red-400 tracking-wide">Arena Cleared</h2>
                            <p className="text-red-300/70 text-xs tracking-widest uppercase">The fight is over</p>
                        </div>

                        {opponentUser && (
                            <div className="w-full bg-red-950/40 border border-red-700/30 rounded-2xl p-4 flex items-center gap-4">
                                <img
                                    src={opponentAvatarSrc}
                                    alt={opponentUser.username}
                                    className="w-12 h-12 rounded-full border-2 border-red-500 object-cover grayscale"
                                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/default-avatar.png'; }}
                                />
                                <div className="flex flex-col">
                                    <span className="text-red-300 text-xs uppercase tracking-widest">Player fled</span>
                                    <span className="text-white font-bold text-lg">{opponentUser.username}</span>
                                </div>
                                <div className="ml-auto text-3xl">🏳️</div>
                            </div>
                        )}

                        <div className="w-full bg-slate-800/50 rounded-xl px-4 py-3 text-center">
                            <p className="text-gray-400 text-sm">{abortData?.reason || 'A player left the arena.'}</p>
                        </div>

                        <div className="w-full bg-green-900/40 border border-green-500/30 rounded-xl px-4 py-3 text-center">
                            <p className="text-green-400 font-bold text-sm">🏆 You are declared the winner!</p>
                        </div>

                        <button
                            onClick={playAgain}
                            className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 text-white font-bold py-4 rounded-xl hover:scale-105 transition-all shadow-lg shadow-green-500/30 text-lg"
                        >
                            ⚔️ Fight Again
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/40 text-gray-400 hover:text-white font-bold py-3 rounded-xl transition-all text-sm"
                        >
                            🚪 Leave Arena
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}