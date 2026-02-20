import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/authToken';
import { refreshAccessToken } from '../utils/api';
import AirHockeyCanvas from '../game/AirHockeyCanvas';

// ---------------------------------------------------------------------------
// Game mode enum — must match backend GameModeEnum
// ---------------------------------------------------------------------------
type GameMode = 'classic' | 'zombie'; // extend if backend adds more

// ---------------------------------------------------------------------------
// Screen states
// ---------------------------------------------------------------------------
type Screen =
    | 'MODE_SELECT'   // choose game mode
    | 'IN_QUEUE'      // waiting for opponent
    | 'READY_CHECK'   // game found, confirm ready
    | 'IN_GAME'       // playing
    | 'GAME_OVER'     // match ended normally
    | 'GAME_ABORTED'; // opponent disconnected / timeout

interface GameOverData {
    winnerId: string;
    score: { left: number; right: number };
}

interface GameAbortedData {
    reason: string;
}

export default function GamePlay() {
    const navigate = useNavigate();

    // Socket — stored in a ref so it never triggers re-renders
    const socketRef = useRef<Socket | null>(null);

    const [screen, setScreen] = useState<Screen>('MODE_SELECT');
    const [side, setSide] = useState<'left' | 'right'>('left');
    const [gameOverData, setGameOverData] = useState<GameOverData | null>(null);
    const [abortData, setAbortData] = useState<GameAbortedData | null>(null);
    const [selectedMode, setSelectedMode] = useState<GameMode>('zombie');
    const [error, setError] = useState<string | null>(null);

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
    // Build and connect the socket once
    // ---------------------------------------------------------------------------
    useEffect(() => {
        let socket: Socket;

        const connect = async () => {
            let token = getToken();
            if (!token) {
                const refreshed = await refreshAccessToken();
                if (!refreshed) {
                    navigate('/login');
                    return;
                }
                token = getToken();
            }

            socket = io({
                path: '/socket.io',
                transports: ['websocket'],
                withCredentials: true,
                auth: { token },
            });

            socket.on('connect', () => {
                console.log('[GamePlay] Socket connected:', socket.id);
                setError(null);
            });

            socket.on('connect_error', (err) => {
                console.error('[GamePlay] Connection error:', err.message);
                setError('Could not connect to game server. Please try again.');
            });

            socket.on('gameFound', (data: { gameId: string; side: 'left' | 'right'; mode: GameMode }) => {
                console.log('[GamePlay] Game found:', data);
                setSide(data.side);
                setScreen('READY_CHECK');
            });

            socket.on('gameAborted', (data: GameAbortedData) => {
                setAbortData(data);
                setScreen('GAME_ABORTED');
            });

            socketRef.current = socket;
        };

        connect();

        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [navigate]);

    // ---------------------------------------------------------------------------
    // Actions
    // ---------------------------------------------------------------------------
    const joinQueue = useCallback(() => {
        if (!socketRef.current) return;
        socketRef.current.emit('joinQueue', { mode: selectedMode });
        setScreen('IN_QUEUE');
    }, [selectedMode]);

    const leaveQueue = useCallback(() => {
        socketRef.current?.emit('leaveQueue');
        setScreen('MODE_SELECT');
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
        setScreen('MODE_SELECT');
    }, []);

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <div className="relative min-h-[100svh] overflow-hidden">
            {/* Background video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/images/zombie.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-black/40" />

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-start md:justify-center p-4 sm:p-6 gap-4 sm:gap-6 pt-10">

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
                        <p className="text-white font-bold text-lg">Choose Game Mode</p>

                        <div className="flex gap-3 w-full">
                            {(['zombie', 'classic'] as GameMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setSelectedMode(mode)}
                                    className={`flex-1 py-3 rounded-xl font-bold capitalize border-2 transition-all duration-200 text-sm ${
                                        selectedMode === mode
                                            ? 'border-green-400 bg-green-900/50 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                            : 'border-slate-600 bg-slate-800/50 text-gray-400 hover:border-slate-500'
                                    }`}
                                >
                                    {mode === 'zombie' ? '🧟 Zombie' : '🏒 Classic'}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={joinQueue}
                            disabled={!socketRef.current}
                            className="group relative w-full bg-gradient-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:via-green-400 hover:to-green-500 disabled:from-slate-600 disabled:to-slate-600 text-white py-4 px-8 font-bold rounded-xl shadow-2xl shadow-green-500/40 transition-all duration-300 text-lg hover:scale-105 border-2 border-green-400/50 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span>🎮 FIND MATCH</span>
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            ← Back
                        </button>
                    </div>
                )}

                {/* ── IN QUEUE ── */}
                {screen === 'IN_QUEUE' && (
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-green-500/30 rounded-3xl p-10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
                        <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                        <p className="text-green-300 font-bold text-xl">Searching for opponent…</p>
                        <p className="text-gray-400 text-sm capitalize">Mode: {selectedMode}</p>
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
                    <div className="w-full max-w-5xl aspect-video min-h-[250px] sm:min-h-[350px] md:min-h-[450px] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.4)] border-4 border-green-500/30">
                        <AirHockeyCanvas
                            side={side}
                            socket={socketRef.current}
                            onGameOver={handleGameOver}
                            onGameAborted={handleGameAborted}
                        />
                    </div>
                )}

                {/* ── GAME OVER ── */}
                {screen === 'GAME_OVER' && gameOverData && (
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-green-500/40 rounded-3xl p-10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
                        <div className="text-6xl">{gameOverData.winnerId ? '🏆' : '🤝'}</div>
                        <p className="text-white font-extrabold text-3xl">
                            {/* We don't have the current userId here easily, just show score */}
                            Game Over!
                        </p>
                        <div className="flex items-center gap-6 text-2xl font-bold">
                            <span className="text-green-400">{gameOverData.score.left}</span>
                            <span className="text-gray-500">:</span>
                            <span className="text-red-400">{gameOverData.score.right}</span>
                        </div>
                        <p className="text-gray-400 text-sm">Left : Right</p>
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
                    <div className="bg-slate-900/90 backdrop-blur-xl border border-red-500/40 rounded-3xl p-10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
                        <div className="text-6xl">💀</div>
                        <p className="text-red-400 font-extrabold text-2xl">Game Aborted</p>
                        <p className="text-gray-300 text-sm text-center">{abortData?.reason ?? 'The game was interrupted.'}</p>
                        <button
                            onClick={playAgain}
                            className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold py-4 rounded-xl hover:scale-105 transition-all shadow-lg shadow-red-500/30 text-lg"
                        >
                            Try Again
                        </button>
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-white text-sm transition-colors">
                            ← Back to Lobby
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
