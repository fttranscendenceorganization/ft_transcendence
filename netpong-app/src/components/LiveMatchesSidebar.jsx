const liveMatches = [
    { type: 'last', title: 'Last Match', description: 'Ahmed vs Mohammed - Zombie Land', badge: 'Winner Chicken Dinner !!', badgeColor: 'green' },
    { type: 'recent', title: 'Recent Match', description: 'Houdaifa wins Barbie Pink tournament', badge: 'Winner Chicken Dinner !!', badgeColor: 'orange' },
    { type: 'top', title: 'Top Player', description: 'Youssef - 10 wins streak', badge: 'MVP', badgeColor: 'yellow' },
];

export default function LiveMatchesSidebar() {
    return (
        <div className="hidden xl:flex xl:w-80 bg-slate-800 border-l border-slate-700 flex-col">
            <div className="p-4 border-b border-slate-700">
                <h2 className="text-white font-bold text-lg">Live Matches</h2>
            </div>

            <div className="relative h-48 bg-slate-900">
                <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
                    <source src="/images/small.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="p-4 border-b border-slate-700">
                <h3 className="text-white font-bold text-sm mb-2">Tournament Highlights</h3>
                <p className="text-gray-400 text-xs">Watch the best moments from recent matches</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {liveMatches.map((match, i) => (
                    <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                        {match.type === 'live' && (
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-white font-bold text-xs">{match.badge}</span>
                            </div>
                        )}
                        <p className="text-gray-300 text-sm font-bold mb-1">{match.title}</p>
                        <p className="text-gray-400 text-xs mb-2">{match.description}</p>
                        {match.type !== 'live' && (
                            <span className={`text-${match.badgeColor}-400 text-xs`}>{match.badge}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}