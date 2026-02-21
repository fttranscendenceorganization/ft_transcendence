import { useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import KittyHockey from "../game/KittyHockey";

export default function GameKitty() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Kitty Cat - NetGame";

        const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
        if (link) {
            link.href = "/barbie.svg";
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
                <source src="/images/pink.mp4" type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-gradient-to-br from-pink-900/70 via-black/60 to-red-900/50" />

            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-10 p-6">

                <div className="text-center space-y-3">
                    <h1 className="
                    text-7xl md:text-8xl
                    font-extrabold
                    text-transparent
                    bg-clip-text
                    bg-gradient-to-r
                    from-pink-400
                    via-rose-500
                    to-rose-400
                    drop-shadow-[0_0_25px_rgba(255,105,180,0.8)]
                    tracking-widest
                ">
                        KITTY CAT
                    </h1>

                    <p className="
                    text-pink-400
                    text-xl
                    font-bold
                    tracking-[0.4em]
                    drop-shadow-[0_0_30px_rgba(255,20,147,0.9)]
                ">
                        JUST FOR GIRLS
                    </p>
                </div>

                <div className="
                w-full max-w-5xl aspect-video
                rounded-3xl overflow-hidden
                border-4 border-pink-500/40
                shadow-[0_0_80px_rgba(168,85,247,0.6)]
                backdrop-blur-md
            ">
                    <KittyHockey />
                </div>

                <button
                    onClick={() => navigate('/barbie-pink')}
                    className="
                    px-10 py-3
                    bg-gradient-to-r from-pink-600 via-rose-600 to-rose-500
                    text-white font-bold tracking-widest
                    rounded-xl
                    border-2 border-purple-300
                    shadow-[0_0_80px_rgba(255,105,180,0.5)]
                    hover:scale-110
                    hover:shadow-[0_0_45px_rgba(255,20,147,1)]
                    transition-all duration-300
                "
                >
                    RETURN TO PINK WORLD
                </button>

            </div>

        </div>
    );

}
