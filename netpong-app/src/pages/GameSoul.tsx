import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import SoulHockey from '../game/SoulHockey';

export default function GameSoul() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Soul Society - NetGame";

        const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (link) {
            link.href = "/saule.svg";
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
                <source src="/images/sword.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-black/60 to-stone-900/50" />

            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-10 p-6">

                <div className="text-center space-y-3">
                    <h1 className="
                    text-7xl md:text-8xl
                    font-extrabold
                    text-transparent
                    bg-clip-text
                    bg-gradient-to-r
                    from-gray-400
                    via-slate-500
                    to-stone-400
                    drop-shadow-[0_0_30px_rgba(120,180,255,0.9)]
                    tracking-widest
                ">
                        SOUL SOCIETY
                    </h1>

                    <p className="
                    text-gray-400
                    text-xl
                    font-bold
                    tracking-[0.4em]
                    drop-shadow-[0_0_40px_rgba(200,230,255,1)]
                ">
                        THE SOUL SAVER
                    </p>
                </div>

                <div className="
                w-full max-w-5xl aspect-video
                rounded-3xl overflow-hidden
                border-4 border-gray-500/40
                shadow-[0_0_80px_rgba(180,220,255,0.6)]
                backdrop-blur-md
            ">
                    <SoulHockey />
                </div>

                <button
                    onClick={() => navigate('/soul-society')}
                    className="
                    px-10 py-3
                    bg-gradient-to-r from-gray-600 via-slate-600 to-stone-500
                    text-white font-bold tracking-widest
                    rounded-xl
                    border-2 border-purple-300
                    shadow-[0_0_100px_rgba(200,230,255,0.75)]
                    hover:scale-110
                    hover:shadow-[0_0_45px_rgba(180,220,255,1)]
                    transition-all duration-300
                "
                >
                    RETURN TO REAL WORLD
                </button>

            </div>

        </div>
    );

}
