import AirHockeyCanvas from '../game/AirHockeyCanvas';

export default function GamePlay() {
    return (
        <div className="relative min-h-screen overflow-hidden">
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

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 gap-6">
                <div className="text-center space-y-2">
                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 drop-shadow-[0_0_40px_rgba(34,197,94,0.8)] animate-pulse">
                        ZOMBIE LAND
                    </h1>
                    <p className="text-green-400 text-lg md:text-xl font-bold tracking-widest drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]">
                        SURVIVE THE APOCALYPSE
                    </p>
                </div>

                <div className="w-full max-w-5xl aspect-[16/9] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.4)] border-4 border-green-500/30 hover:border-green-500/60 transition-all duration-300">
                    <AirHockeyCanvas />
                </div>
            </div>
        </div>
    );
}