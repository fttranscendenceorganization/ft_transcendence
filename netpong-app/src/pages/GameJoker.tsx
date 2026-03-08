import { useEffect, useRef, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/api';
import { getFriends, sendFriendRequest } from '../utils/userService';
import { getGameSocket, disconnectGameSocket } from '../utils/gameSocket';
import JokerHockey from '../game/JokerHockey';
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

export default function GameJoker() {
    const navigate = useNavigate();
    const socketRef = useRef<Socket | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [screen, setScreen] = useState<Screen>('MODE_SELECT');
    const [side, setSide] = useState<'left' | 'right'>('left');

    const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
    const [myAvatarSrc, setMyAvatarSrc] = useState('/images/avatar.webp');

    const [opponentUser, setOpponentUser] = useState<UserProfile | null>(null);
    const [opponentAvatarSrc, setOpponentAvatarSrc] = useState('/images/avatar.webp');
    const [opponentStats, setOpponentStats] = useState<{ total: number; wins: number; losses: number; winRate: number } | null>(null);
    const [isFriend, setIsFriend] = useState<boolean | null>(null);

    const [playerStats, setPlayerStats] = useState<{ total: number; wins: number; losses: number; winRate: number } | null>(null);
    const [friendsIds, setFriendsIds] = useState<string[]>([]);
    const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
    const [abortData, setAbortData] = useState<GameAbortedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [showAiPicker, setShowAiPicker] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (screen === 'IN_GAME') {
            video.pause();
        } else {
            video.play().catch(() => { });
        }
    }, [screen]);

    useEffect(() => {
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.documentElement.style.height = '100%';

        const preventScrollKeys = (e: KeyboardEvent) => {
            const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
            if (scrollKeys.includes(e.key)) {
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', preventScrollKeys, { passive: false });

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.height = '';
            window.removeEventListener('keydown', preventScrollKeys);
        };
    }, []);

    useEffect(() => {
        document.title = 'Joker - NetGame';
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
        if (link) link.href = '/joker.svg';
        return () => {
            document.title = 'NetPong';
            if (link) link.href = '/netpong.svg';
        };
    }, []);

    useEffect(() => {
        authFetch('/api/auth/me', { method: 'GET' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                setMyProfile({ id: data.id, username: data.username, avatarUrl: data.avatarUrl });
                setMyAvatarSrc(data.avatarUrl || '/images/avatar.webp');
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const statsRes = await authFetch('/api/game/stats', { method: 'GET' });
                if (statsRes.ok) setPlayerStats(await statsRes.json());
            } catch (e) { }

            try {
                const friends = await getFriends();
                setFriendsIds(friends.map((f: any) => f.id));
            } catch (e) {
                setFriendsIds([]);
            }
        })();
    }, []);

    useEffect(() => {
        if (screen === 'GAME_OVER' || screen === 'GAME_ABORTED') {
            authFetch('/api/game/stats', { method: 'GET' })
                .then(r => r.ok ? r.json() : null)
                .then(stats => { if (stats) setPlayerStats(stats); })
                .catch(() => { });
        }
    }, [screen]);

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

                if (data.opponentId === '__AI_OPPONENT__') {
                    setOpponentUser({ id: data.opponentId, username: 'AI Bot', avatarUrl: null });
                    setOpponentAvatarSrc('/images/avatar.webp');
                    setOpponentStats({ total: 0, wins: 0, losses: 0, winRate: 0 });
                    setIsFriend(false);
                    setScreen('READY_CHECK');
                    return;
                }

                try {
                    const oppUser = await getUserById(data.opponentId);
                    setOpponentUser({ id: data.opponentId, username: oppUser.username, avatarUrl: oppUser.avatarUrl });
                    setOpponentAvatarSrc(oppUser.avatarUrl || '/images/avatar.webp');
                    setIsFriend(friendsIds.includes(data.opponentId));
                } catch {
                    setOpponentUser({ id: data.opponentId, username: 'Opponent', avatarUrl: null });
                    setOpponentAvatarSrc('/images/avatar.webp');
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

    const myName = myProfile?.username ? `${myProfile.username} (You)` : 'You';
    const myScore = gameOverData ? (side === 'left' ? gameOverData.score.left : gameOverData.score.right) : 0;
    const opponentScore = gameOverData ? (side === 'left' ? gameOverData.score.right : gameOverData.score.left) : 0;
    const iWon = !!myProfile && gameOverData?.winnerId === myProfile.id;

    const joinQueue = useCallback(() => {
        if (!socketRef.current) {
            setError('Could not connect to game server. Please try again.');
            return;
        }
        socketRef.current.emit('joinQueue', { mode: 'JOKER' as BackendGameMode });
        setScreen('IN_QUEUE');
    }, []);

    const playAi = useCallback((difficulty: 'easy' | 'hard') => {
        if (!socketRef.current) {
            setError('Could not connect to game server. Please try again.');
            return;
        }
        setShowAiPicker(false);
        socketRef.current.emit('playAi', { mode: 'JOKER' as BackendGameMode, difficulty });
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
        setOpponentAvatarSrc('/images/avatar.webp');
        setIsFriend(null);
        setProfileError(null);
        setScreen('MODE_SELECT');
    }, []);

    const exitGame = useCallback(() => {
        try { socketRef.current?.emit('forfeit'); } catch (e) { }
        navigate('/');
    }, [navigate]);

    useEffect(() => {
        const onBeforeUnload = () => {
            try {
                if (socketRef.current && screen === 'IN_GAME')
                    socketRef.current.emit('forfeit');
            } catch (e) { }
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

    const MyCard = (
        <div className="flex items-center gap-4">
            <div className="relative">
                <img
                    src={myAvatarSrc}
                    alt={myName}
                    className="w-16 h-16 rounded-full border-2 border-purple-400 object-cover"
                    style={{ boxShadow: '0 0 12px rgba(168,85,247,0.6)' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/avatar.webp'; }}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-slate-900" />
            </div>
            <div className="flex flex-col">
                <span className="text-purple-400 font-bold text-lg tracking-wide">{myName}</span>
                {playerStats && (
                    <div className="mt-1 grid grid-cols-2 gap-x-3 text-xs text-purple-300/70">
                        <span>Games <span className="text-white font-semibold">{playerStats.total}</span></span>
                        <span>Wins <span className="text-green-400 font-semibold">{playerStats.wins}</span></span>
                        <span>Losses <span className="text-fuchsia-400 font-semibold">{playerStats.losses}</span></span>
                        <span>Rate <span className="text-yellow-300 font-semibold">{playerStats.winRate}%</span></span>
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
                    className="w-16 h-16 rounded-full border-2 border-fuchsia-400 object-cover"
                    style={{ boxShadow: '0 0 12px rgba(232,121,249,0.6)' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/avatar.webp'; }}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-fuchsia-400 rounded-full border-2 border-slate-900" />
            </div>
            <div className="flex flex-col">
                <span className="text-fuchsia-400 font-bold text-lg tracking-wide">{opponentUser.username}</span>
                {opponentStats ? (
                    <div className="mt-1 grid grid-cols-2 gap-x-3 text-xs text-fuchsia-300/70">
                        <span>Games <span className="text-white font-semibold">{opponentStats.total}</span></span>
                        <span>Wins <span className="text-green-400 font-semibold">{opponentStats.wins}</span></span>
                        <span>Losses <span className="text-fuchsia-400 font-semibold">{opponentStats.losses}</span></span>
                        <span>Rate <span className="text-yellow-300 font-semibold">{opponentStats.winRate}%</span></span>
                    </div>
                ) : (
                    <span className="mt-1 text-xs text-fuchsia-400 animate-pulse">🃏 Loading...</span>
                )}
                {isFriend === true && (
                    <span className="text-xs text-purple-400 font-semibold mt-1">✓ Accomplice</span>
                )}
            </div>
        </div>
    ) : null;

    return (
        <div className="relative h-[100svh] overflow-hidden">
            <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover brightness-75 contrast-125 saturate-150">
                <source src="/images/joker.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-black/60 to-green-900/50" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <span className="joker-float text-purple-500 text-4xl" style={{ top: '10%', left: '5%' }}>HAHAHA</span>
                <span className="joker-float text-green-400 text-3xl" style={{ top: '70%', left: '15%', animationDelay: '2s' }}>HA HA HA</span>
                <span className="joker-float text-fuchsia-500 text-5xl" style={{ top: '40%', left: '80%', animationDelay: '1s' }}>HAHAHAHA</span>
                <span className="joker-float text-purple-400 text-2xl" style={{ top: '85%', left: '60%', animationDelay: '3s' }}>HA!</span>
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 sm:p-6 gap-4 sm:gap-6 overflow-hidden">

                <div className="text-center space-y-1 landscape:scale-75 sm:landscape:scale-100 transition-transform">
                    <h1
                        className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-green-400"
                        style={{ filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.9))' }}
                    >
                        JOKER
                    </h1>
                    <p
                        className="text-green-400 text-base md:text-lg font-bold tracking-[0.4em] uppercase landscape:hidden sm:landscape:block"
                        style={{ textShadow: '0 0 15px rgba(34,197,94,0.8)' }}
                    >
                        THE GAME MAKER
                    </p>
                </div>

                {error && (
                    <div className="bg-purple-950/80 border border-fuchsia-600 text-fuchsia-300 rounded-xl px-6 py-3 text-sm font-semibold">
                        🃏 {error}
                    </div>
                )}

                {screen === 'MODE_SELECT' && (
                    <div
                        className="bg-black/70 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 flex flex-col items-center gap-6 w-full max-w-sm"
                        style={{ boxShadow: '0 0 30px rgba(168,85,247,0.15)' }}
                    >
                        <h2 className="text-purple-400 font-bold text-2xl tracking-wide">Why so serious?</h2>
                        <p className="text-purple-300/60 text-sm text-center">Let's put a smile on that face.</p>
                        <button
                            onClick={joinQueue}
                            className="group relative w-full font-extrabold py-4 px-8 rounded-xl transition-all duration-200 text-lg hover:scale-105 overflow-hidden text-black"
                            style={{
                                background: 'linear-gradient(to right, #9333ea, #d946ef, #22c55e)',
                                boxShadow: '0 0 20px rgba(168,85,247,0.5)',
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            🃏 FIND MATCH
                        </button>
                        <button
                            onClick={() => setShowAiPicker(!showAiPicker)}
                            className="group relative w-full bg-transparent hover:bg-slate-800/60 text-gray-300 hover:text-white font-extrabold py-4 px-8 rounded-xl transition-all duration-200 text-lg hover:scale-105 border border-slate-600/50 hover:border-purple-400/60 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            🏒  vs AI
                        </button>
                        {showAiPicker && (
                            <div className="flex gap-3 w-full">
                                <button onClick={() => playAi('easy')} className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 hover:scale-105 bg-green-700 hover:bg-green-600 border border-green-500/50">🟢 Easy</button>
                                <button onClick={() => playAi('hard')} className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 hover:scale-105 bg-red-700 hover:bg-red-600 border border-red-500/50">🔴 Hard</button>
                            </div>
                        )}
                        <button onClick={() => navigate('/joker')} className="text-gray-600 hover:text-gray-300 text-sm transition-colors">← Back</button>
                    </div>
                )}

                {screen === 'IN_QUEUE' && (
                    <div
                        className="bg-black/70 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm"
                        style={{ boxShadow: '0 0 30px rgba(168,85,247,0.15)' }}
                    >
                        <div className="flex gap-3">
                            {['🃏', '🎭', '😈'].map((e, i) => (
                                <span key={i} className="text-2xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
                            ))}
                        </div>
                        <p className="text-purple-400 font-bold text-xl tracking-wide">Searching for a punchline…</p>
                        <p className="text-purple-700 text-sm">Finding someone to play with</p>
                        <button onClick={leaveQueue} className="text-fuchsia-500 hover:text-fuchsia-300 text-sm font-semibold border border-fuchsia-700/40 rounded-lg px-4 py-2 hover:bg-fuchsia-950/40 transition-all">✗ Abandon the game</button>
                    </div>
                )}

                {screen === 'READY_CHECK' && (
                    <div
                        className="bg-black/70 backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm"
                        style={{ border: '2px solid rgba(168,85,247,0.4)', boxShadow: '0 0 30px rgba(168,85,247,0.25)' }}
                    >
                        <div className="text-5xl animate-bounce">🃏</div>
                        <p className="font-extrabold text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400" style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.6))' }}>Victim Found!</p>
                        <p className="text-gray-400 text-sm">You are on the <span className={`font-bold ${side === 'left' ? 'text-purple-400' : 'text-fuchsia-400'}`}>{side.toUpperCase()}</span> side</p>
                        {opponentUser && (
                            <div className="flex items-center gap-3 bg-slate-900/60 border border-purple-700/40 rounded-xl px-4 py-3">
                                <img src={opponentAvatarSrc} alt={opponentUser.username} className="w-10 h-10 rounded-full border-2 border-fuchsia-400 object-cover" onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/avatar.webp'; }} />
                                <span className="text-gray-300 text-sm">vs <span className="font-bold text-white">{opponentUser.username}</span></span>
                            </div>
                        )}
                        <p className="text-gray-600 text-xs text-center">Both players must confirm within 30 seconds</p>
                        <button onClick={confirmReady} className="w-full text-black font-extrabold py-4 rounded-xl hover:scale-105 transition-all duration-200 text-lg" style={{ background: 'linear-gradient(to right, #9333ea, #d946ef, #22c55e)', boxShadow: '0 0 20px rgba(168,85,247,0.5)' }}>🎭 I'M READY</button>
                    </div>
                )}

                {screen === 'IN_GAME' && socketRef.current && (
                    <div className="relative w-full max-w-5xl flex flex-col gap-3">
                        {opponentUser && (
                            <div className="w-full bg-black/70 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between gap-4" style={{ boxShadow: '0 0 20px rgba(168,85,247,0.1)' }}>
                                {side === 'left' ? MyCard : OppCard}
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-green-400">🃏</span>
                                    <span className="text-[10px] font-bold text-purple-700 mt-1 tracking-widest uppercase">Joker</span>
                                </div>
                                {side === 'left' ? OppCard : MyCard}
                            </div>
                        )}
                        <div className="aspect-video min-h-[200px] max-h-[70vh] sm:min-h-[360px] md:min-h-[450px] rounded-2xl overflow-hidden border-2 border-purple-500/30" style={{ boxShadow: '0 0 60px rgba(168,85,247,0.3)' }}>
                            <JokerHockey side={side} socket={socketRef.current} onGameOver={handleGameOver} onGameAborted={handleGameAborted} />
                        </div>
                        <button onClick={exitGame} className="w-full bg-fuchsia-950/60 hover:bg-fuchsia-900/70 border border-fuchsia-800/50 text-fuchsia-400 hover:text-fuchsia-300 font-bold py-3 rounded-xl transition-all text-sm tracking-wide flex items-center justify-center gap-2">
                            Exit the Stage <span className="text-xs text-fuchsia-700 font-normal">(opponent wins)</span>
                        </button>
                    </div>
                )}

                {screen === 'GAME_OVER' && gameOverData && (
                    <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm" style={{ border: `2px solid ${iWon ? 'rgba(168,85,247,0.5)' : 'rgba(232,121,249,0.4)'}`, boxShadow: `0 0 40px ${iWon ? 'rgba(168,85,247,0.2)' : 'rgba(232,121,249,0.15)'}` }}>
                        <div className="text-7xl">{iWon ? '🃏' : '🎭'}</div>
                        <h2 className="text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-green-400" style={{ filter: `drop-shadow(0 0 20px ${iWon ? 'rgba(168,85,247,0.6)' : 'rgba(232,121,249,0.6)'})` }}>{iWon ? 'HA HA HA!' : 'No Laughs...'}</h2>
                        <div className="w-full bg-slate-900/60 border border-purple-700/40 rounded-xl p-4 flex items-center justify-around">
                            <div className="flex flex-col items-center gap-1">
                                <img src={myAvatarSrc} alt={myName} className="w-12 h-12 rounded-full border-2 border-purple-400 object-cover" onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/avatar.webp'; }} />
                                <span className="text-sm font-bold text-white">{myName}</span>
                                <span className="text-3xl font-extrabold text-purple-400">{myScore}</span>
                            </div>
                            <span className="text-2xl text-gray-600">🃏</span>
                            <div className="flex flex-col items-center gap-1">
                                <img src={opponentAvatarSrc} alt={opponentUser?.username || 'Opponent'} className="w-12 h-12 rounded-full border-2 border-fuchsia-400 object-cover" onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/avatar.webp'; }} />
                                <span className="text-sm font-bold text-fuchsia-300">{opponentUser?.username || 'Opponent'}</span>
                                <span className="text-3xl font-extrabold text-fuchsia-400">{opponentScore}</span>
                            </div>
                        </div>
                        <button onClick={playAgain} className="w-full text-black font-extrabold py-4 rounded-xl hover:scale-105 transition-all text-lg" style={{ background: 'linear-gradient(to right, #9333ea, #d946ef, #22c55e)', boxShadow: '0 0 20px rgba(168,85,247,0.5)' }}>🃏 Play Again</button>
                        <button onClick={() => navigate('/joker')} className="text-gray-600 hover:text-gray-300 text-sm transition-colors">← RETURN TO THE BOARD</button>
                    </div>
                )}

                {screen === 'GAME_ABORTED' && (
                    <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm" style={{ border: '2px solid rgba(168,85,247,0.4)', boxShadow: '0 0 40px rgba(168,85,247,0.15)' }}>
                        <div className="text-7xl animate-bounce">🎭</div>
                        <h2 className="text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400" style={{ filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.6))' }}>Joke's On Them</h2>
                        <p className="text-purple-700 text-xs tracking-widest uppercase">The coward ran from the punchline</p>
                        {opponentUser && (
                            <div className="w-full bg-purple-950/30 border border-purple-800/30 rounded-xl p-4 flex items-center gap-4">
                                <img src={opponentAvatarSrc} alt={opponentUser.username} className="w-12 h-12 rounded-full border-2 border-purple-700 object-cover grayscale" onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/avatar.webp'; }} />
                                <div className="flex flex-col">
                                    <span className="text-purple-700 text-xs uppercase tracking-widest">Couldn't take the game</span>
                                    <span className="text-white font-bold text-lg">{opponentUser.username}</span>
                                </div>
                            </div>
                        )}
                        <div className="w-full bg-slate-900/50 border border-slate-700/30 rounded-xl px-4 py-3 text-center">
                            <p className="text-gray-500 text-sm">{abortData?.reason || 'A player abandoned the stage.'}</p>
                        </div>
                        <div className="w-full rounded-xl px-4 py-3 text-center" style={{ background: 'rgba(88,28,135,0.3)', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 0 10px rgba(168,85,247,0.15)' }}>
                            <p className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">🏆 You had the last laugh!</p>
                        </div>
                        <button onClick={playAgain} className="w-full text-black font-extrabold py-4 rounded-xl hover:scale-105 transition-all text-lg" style={{ background: 'linear-gradient(to right, #9333ea, #d946ef, #22c55e)', boxShadow: '0 0 20px rgba(168,85,247,0.5)' }}>🃏 Another Round</button>
                        <button onClick={() => navigate('/joker')} className="w-full bg-slate-900/60 hover:bg-slate-800/60 border border-slate-700/40 text-gray-500 hover:text-white font-bold py-3 rounded-xl transition-all text-sm">Leave the Stage</button>
                    </div>
                )}
            </div>

            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 p-6 text-center sm:hidden landscape:flex">
                <div className="text-6xl mb-4 animate-bounce">🃏</div>
                <h2 className="text-2xl font-bold text-purple-400 mb-2">Why so sideways?</h2>
                <p className="text-gray-300 max-w-xs">
                    The Joker's stage is too narrow for this view.
                    Please rotate your phone to <span className="text-green-400 font-bold">Portrait</span> mode to play.
                </p>
                <div className="mt-8 w-12 h-16 border-4 border-purple-500 rounded-lg animate-[spin_3s_linear_infinite]" />
            </div>

            <style>{`
                @keyframes jokerFloat {
                    0% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
                    50% { transform: translateY(-40px) rotate(3deg); opacity: 0.6; }
                    100% { transform: translateY(0px) rotate(-3deg); opacity: 0.2; }
                }
                .joker-float {
                    position: absolute;
                    font-weight: 900;
                    letter-spacing: 4px;
                    animation: jokerFloat 6s ease-in-out infinite;
                    text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor;
                }
            `}</style>
        </div>
    );
}