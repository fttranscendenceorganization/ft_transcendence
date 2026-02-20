import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import JokerHockey from '../game/JokerHockey';

export default function GameJoker() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Joker - NetGame";

        const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (link) {
            link.href = "/joker.svg";
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.title = "NetPong";

            if (link) {
                link.href = "/netpong.svg";
            }

            document.body.style.overflow = originalOverflow;
        };
    }, []);


    return (
        <div className="relative h-[100svh] w-screen overflow-hidden bg-black">

            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover brightness-75 contrast-125 saturate-150"
            >
                <source src="/images/joker.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-black/60 to-green-900/50" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">

                <span className="joker-float text-purple-500 text-4xl top-[10%] left-[5%]">
                    HAHAHA
                </span>

                <span className="joker-float text-green-400 text-3xl top-[70%] left-[15%]">
                    HA HA HA
                </span>

                <span className="joker-float text-fuchsia-500 text-5xl top-[40%] left-[80%]">
                    HAHAHAHA
                </span>

                <span className="joker-float text-purple-400 text-2xl top-[85%] left-[60%]">
                    HA!
                </span>

            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-10 p-6">

                <div className="text-center space-y-3">
                    <h1 className="
                    text-7xl md:text-8xl
                    font-extrabold
                    text-transparent
                    bg-clip-text
                    bg-gradient-to-r
                    from-purple-400
                    via-fuchsia-500
                    to-green-400
                    drop-shadow-[0_0_30px_rgba(168,85,247,0.9)]
                    tracking-widest
                ">
                        JOKER
                    </h1>

                    <p className="
                    text-green-400
                    text-xl
                    font-bold
                    tracking-[0.4em]
                    drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]
                ">
                        THE GAME MAKER
                    </p>
                </div>

                <div className="
                w-full max-w-5xl aspect-video
                rounded-3xl overflow-hidden
                border-4 border-purple-500/40
                shadow-[0_0_80px_rgba(168,85,247,0.6)]
                backdrop-blur-md
            ">
                    <JokerHockey />
                </div>

                <button
                    onClick={() => navigate('/joker')}
                    className="
                    px-10 py-3
                    bg-gradient-to-r from-purple-600 via-fuchsia-600 to-green-500
                    text-white font-bold tracking-widest
                    rounded-xl
                    border-2 border-purple-300
                    shadow-[0_0_25px_rgba(168,85,247,0.8)]
                    hover:scale-110
                    hover:shadow-[0_0_45px_rgba(34,197,94,1)]
                    transition-all duration-300
                "
                >
                    RETURN TO BOARD GAME
                </button>

            </div>

            <style>
                {`
            @keyframes jokerFloat {
            0% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0.2;
            }
            50% {
                transform: translateY(-40px) rotate(3deg);
                opacity: 0.6;
            }
            100% {
                transform: translateY(0px) rotate(-3deg);
                opacity: 0.2;
            }
            }

            .joker-float {
            position: absolute;
            font-weight: 900;
            letter-spacing: 4px;
            animation: jokerFloat 6s ease-in-out infinite;
            text-shadow:
                0 0 10px currentColor,
                0 0 20px currentColor,
                0 0 40px currentColor;
            }
            `}
            </style>

        </div>
    );

}
