import { useNavigate } from "react-router-dom";
import AirHockeyCanvas from '../game/AirHockeyCanvas';

export default function GamePlay() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-[100svh] overflow-hidden">
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

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 gap-8">

                <div className="text-center space-y-2">
                    <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 drop-shadow-[0_0_40px_rgba(34,197,94,0.8)] animate-pulse">
                        ZOMBIE LAND
                    </h1>
                    <p className="text-green-400 text-lg font-bold tracking-widest">
                        SURVIVE THE APOCALYPSE
                    </p>
                </div>

                <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.4)] border-4 border-green-500/30">
                    <AirHockeyCanvas />
                </div>

                <button
                    onClick={() => {
                        //socket.close(); remove the comment after using webSocket in the server side
                        navigate('/zombie-land');
                    }}
                    className="
                        px-8 py-3
                        bg-green-600/80
                        text-white font-bold tracking-wider
                        rounded-xl
                        border-2 border-green-400
                        shadow-[0_0_20px_rgba(34,197,94,0.8)]
                        hover:bg-green-500
                        hover:animate-pulse
                        hover:shadow-[0_0_30px_rgba(34,197,94,1)]
                        transition-all duration-300
                        backdrop-blur-md
                    "
                >
                    RETURN TO SAFE ZONE
                </button>

            </div>
        </div>
    );
}
