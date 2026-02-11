import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Leaderboard() {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        document.title = "Leaderboard - NetPong";

        setPlayers([
            {
                id: 1,
                username: 'Ahmed',
                avatar: '',
                rank: 'Diamond',
                level: 55,
                wins: 12,
                losses: 8,
                winRate: 80,
                points: 480,
            },
            {
                id: 2,
                username: 'Mohamed',
                avatar: '',
                rank: 'Platinum',
                level: 48,
                wins: 27,
                losses: 8,
                winRate: 75,
                points: 320,
            },
            {
                id: 3,
                username: 'Houdaifa',
                avatar: '',
                rank: 'Gold',
                level: 39,
                wins: 24,
                losses: 12,
                winRate: 68,
                points: 310,
            },
            {
                id: 4,
                username: 'Youssef',
                avatar: '',
                rank: 'Gold',
                level: 42,
                wins: 19,
                losses: 12,
                winRate: 66,
                points: 290,
            },
            {
                id: 5,
                username: 'Amr',
                avatar: '',
                rank: 'Silver',
                level: 36,
                wins: 17,
                losses: 12,
                winRate: 59,
                points: 250,
            },
            {
                id: 6,
                username: 'Karim',
                avatar: '',
                rank: 'Silver',
                level: 33,
                wins: 15,
                losses: 16,
                winRate: 51,
                points: 200,
            },
            {
                id: 7,
                username: 'Zineb',
                avatar: '',
                rank: 'Bronze',
                level: 28,
                wins: 12,
                losses: 18,
                winRate: 44,
                points: 170,
            },
        ]);
    }, []);

    const topThree = players.slice(0, 3);
    const restOfPlayers = players.slice(3);

    const getRankColor = (rank) => {
        const colors = {
            'Diamond': 'from-cyan-400 to-blue-500',
            'Platinum': 'from-gray-300 to-gray-500',
            'Gold': 'from-yellow-400 to-yellow-600',
            'Silver': 'from-gray-400 to-gray-600',
            'Bronze': 'from-orange-400 to-orange-600',
        };
        return colors[rank] || 'from-gray-400 to-gray-600';
    };

    const getRankBadge = (rank) => {
        const badges = {
            'Diamond': '💎',
            'Platinum': '⚪',
            'Gold': '🥇',
            'Silver': '🥈',
            'Bronze': '🥉',
        };
        return badges[rank] || '🏅';
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/images/zone.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/50 to-slate-950/70 backdrop-blur-[2px]" />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-[10%] w-2 h-2 bg-violet-500/40 rounded-full animate-ping"></div>
                <div className="absolute top-40 right-[15%] w-3 h-3 bg-orange-500/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-40 left-[20%] w-2 h-2 bg-cyan-500/30 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
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

                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl px-6 py-3 border border-orange-500/30 shadow-lg">
                            <div className="text-orange-400 font-bold text-sm">Total Players</div>
                            <div className="text-white text-2xl font-extrabold">{players.length}</div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl px-6 py-3 border border-violet-500/30 shadow-lg">
                            <div className="text-violet-400 font-bold text-sm">Active Now</div>
                            <div className="text-white text-2xl font-extrabold">{Math.floor(players.length * 0.4)}</div>
                        </div>
                        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl px-6 py-3 border border-cyan-500/30 shadow-lg">
                            <div className="text-cyan-400 font-bold text-sm">Avg Level</div>
                            <div className="text-white text-2xl font-extrabold">
                                {Math.floor(players.reduce((sum, p) => sum + p.level, 0) / players.length)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            👑 Champions
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {topThree[1] && (
                            <div className="md:order-1 order-2">
                                <PodiumCard player={topThree[1]} position={2} getRankColor={getRankColor} getRankBadge={getRankBadge} />
                            </div>
                        )}

                        {topThree[0] && (
                            <div className="md:order-2 order-1">
                                <PodiumCard player={topThree[0]} position={1} getRankColor={getRankColor} getRankBadge={getRankBadge} isWinner />
                            </div>
                        )}

                        {topThree[2] && (
                            <div className="md:order-3 order-3">
                                <PodiumCard player={topThree[2]} position={3} getRankColor={getRankColor} getRankBadge={getRankBadge} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="bg-slate-900/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-violet-500/30 overflow-hidden">
                        <div className="grid grid-cols-12 px-4 md:px-6 py-4 border-b border-slate-700/50 bg-slate-800/40">
                            <div className="col-span-1 text-gray-400 text-xs md:text-sm font-bold">#</div>
                            <div className="col-span-6 md:col-span-4 text-gray-400 text-xs md:text-sm font-bold">Player</div>
                            <div className="col-span-5 md:col-span-7 grid grid-cols-3 md:grid-cols-5 gap-2 text-gray-400 text-xs md:text-sm font-bold">
                                <span className="hidden md:block">Rank</span>
                                <span className="hidden md:block">Level</span>
                                <span>Wins</span>
                                <span>W/L</span>
                            </div>
                        </div>

                        {restOfPlayers.map((player, index) => (
                            <PlayerRow
                                key={player.id}
                                player={player}
                                position={index + 4}
                                getRankColor={getRankColor}
                                getRankBadge={getRankBadge}
                            />
                        ))}
                    </div>

                    <div className="flex justify-center mt-8">
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
            </div>
        </div>
    );
}

function PodiumCard({ player, position, getRankColor, getRankBadge, isWinner = false }) {
    const positionColors = {
        1: 'from-yellow-400 to-yellow-600',
        2: 'from-gray-300 to-gray-500',
        3: 'from-orange-400 to-orange-600',
    };

    const positionEmojis = {
        1: '🥇',
        2: '🥈',
        3: '🥉',
    };

    const borderColors = {
        1: 'border-yellow-500/60',
        2: 'border-gray-400/60',
        3: 'border-orange-500/60',
    };

    return (
        <div
            className={`relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border-2 ${borderColors[position]} shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] ${isWinner ? 'md:-mt-4' : 'md:mt-8'}`}
            style={{ animationDelay: `${position * 100}ms` }}
        >

            <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${positionColors[position]} rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-white/20`}>
                    {positionEmojis[position]}
                </div>
            </div>

            <div className="flex justify-center mb-4">
                <div className="relative">
                    <img
                        src={player.avatar || ''}
                        alt={player.username}
                        className={`w-24 h-24 rounded-full object-cover border-4 ${isWinner ? 'border-yellow-400' : 'border-white/30'} shadow-xl`}
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-4 border-slate-900 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{player.level}</span>
                    </div>
                </div>
            </div>

            <div className="text-center mb-4">
                <h3 className="text-white text-xl font-extrabold mb-1 flex items-center justify-center gap-2">
                    <span>{player.country}</span>
                    <span>{player.username}</span>
                </h3>
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${getRankColor(player.rank)} bg-opacity-20 px-4 py-1 rounded-full border border-white/20`}>
                    <span className="text-lg">{getRankBadge(player.rank)}</span>
                    <span className="text-white text-sm font-bold">{player.rank}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div className="text-center">
                    <div className="text-green-400 text-xl font-extrabold">{player.wins}</div>
                    <div className="text-gray-400 text-xs">Wins</div>
                </div>
                <div className="text-center">
                    <div className="text-violet-400 text-xl font-extrabold">{player.winRate}%</div>
                    <div className="text-gray-400 text-xs">Win Rate</div>
                </div>
                <div className="text-center">
                    <div className="text-orange-400 text-xl font-extrabold">{player.points}</div>
                    <div className="text-gray-400 text-xs">Points</div>
                </div>
            </div>
        </div>
    );
}

function PlayerRow({ player, position, getRankColor, getRankBadge }) {
    return (
        <div className="group grid grid-cols-12 px-4 md:px-6 py-4 items-center border-b border-slate-800/50 hover:bg-violet-500/10 transition-all duration-300 cursor-pointer">
            <div className="col-span-1">
                <div className="text-lg md:text-xl font-extrabold text-violet-400 group-hover:text-orange-400 transition-colors">
                    #{position}
                </div>
            </div>

            <div className="col-span-6 md:col-span-4 flex items-center gap-3">
                <div className="relative">
                    <img
                        src={player.avatar || '/images/default-avatar.png'}
                        alt={player.username}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-violet-500/40 shadow-lg group-hover:border-orange-500/60 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{player.level}</span>
                    </div>
                </div>
                <div className="min-w-0">
                    <div className="text-white font-bold text-sm md:text-base truncate flex items-center gap-1">
                        <span>{player.country}</span>
                        <span className="truncate">{player.username}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs">{getRankBadge(player.rank)}</span>
                        <span className="text-gray-400 text-xs">{player.rank}</span>
                    </div>
                </div>
            </div>

            <div className="col-span-5 md:col-span-7 grid grid-cols-3 md:grid-cols-5 gap-2 text-xs md:text-sm">
                <div className="hidden md:flex items-center">
                    <div className={`bg-gradient-to-r ${getRankColor(player.rank)} bg-opacity-20 px-3 py-1 rounded-full border border-white/20 text-white font-bold text-xs`}>
                        {player.rank}
                    </div>
                </div>

                <div className="hidden md:flex items-center">
                    <div className="bg-orange-500/20 text-orange-300 border border-orange-500/40 px-3 py-1 rounded-full font-bold">
                        Lv {player.level}
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="bg-green-500/20 text-green-300 border border-green-500/40 px-2 md:px-3 py-1 rounded-full font-bold">
                        {player.wins}
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="bg-violet-500/20 text-violet-300 border border-violet-500/40 px-2 md:px-3 py-1 rounded-full font-bold">
                        {player.winRate}%
                    </div>
                </div>

            </div>
        </div>
    );
}