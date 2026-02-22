import { useEffect, useRef } from 'react';

type Vec2 = { x: number; y: number }; // Creation of a type of a 2D vector (act as a bluePrint)

type GameState = {
    puck: { x: number; y: number; r: number };
    player: { x: number; y: number; r: number };
    ai: { x: number; y: number; r: number };
    playerScore: number;
    aiScore: number;
}; // Same Create a bluePrint for the Game state (Need to be respected)

export default function SoulHockey() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d'); // Create the Canvas for the game
        if (!ctx) return;

        let worldWidth = 0;
        let worldHeight = 0;

        // Server Game state (as described in the BluePrint)
        let gameState: GameState = {
            puck: { x: 300, y: 200, r: 12 },
            player: { x: 100, y: 200, r: 20 },
            ai: { x: 500, y: 200, r: 20 },
            playerScore: 0,
            aiScore: 0,
        };

        // Here this function is responsable for the resize in all devices (Desktop, Mobile)
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            worldWidth = rect.width;
            worldHeight = rect.height;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Reset the size here to fix the new sizes espiselly the mobile size
            const paddleRadius = worldHeight * 0.09; // 9% of table height
            const puckRadius = worldHeight * 0.045;  // 4.5% of table height
            gameState.player.r = paddleRadius;
            gameState.ai.r = paddleRadius;
            gameState.puck.r = puckRadius;
            gameState.puck.x = worldWidth / 2;
            gameState.puck.y = worldHeight / 2;
            gameState.player.x = worldWidth * 0.15;
            gameState.player.y = worldHeight / 2;
            gameState.ai.x = worldWidth * 0.85;
            gameState.ai.y = worldHeight / 2;

        };

        resize();
        window.addEventListener('resize', resize);

        // Input Keys comes from the user (Client)
        const keys = { up: false, down: false, left: false, right: false };
        const mouse = { x: 0, y: 0 };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'w' || e.key === 'ArrowUp') keys.up = true;
            if (e.key === 's' || e.key === 'ArrowDown') keys.down = true;
            if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
            if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
        };

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'w' || e.key === 'ArrowUp') keys.up = false;
            if (e.key === 's' || e.key === 'ArrowDown') keys.down = false;
            if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
            if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
        };

        // Input for The mouse moves
        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;

        }

        // Touche Moves (For mobile)
        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touche = e.touches[0];
            mouse.x = touche.clientX - rect.left;
            mouse.y = touche.clientY - rect.top;
        }

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: false });

        // Creation of WEBSOCKET
        const socket = new WebSocket('ws://localhost:3001'); // use wss for HTTPS

        socket.onmessage = (event) => {
            try {
                const serverState = JSON.parse(event.data);
                gameState = serverState; // authoritative overwrite
            } catch (err) {
                console.error('Bad server state', err);
            }
        }; // For the server side (means what comes from the server to the client)

        const sendInput = () => {
            if (socket.readyState !== WebSocket.OPEN) return;

            socket.send(
                JSON.stringify({
                    type: 'input',
                    keys: { ...keys },
                    mouse: { ...mouse },
                })
            );
        }; // For client size (what client send to the server)

        // Render Loop
        const loop = () => {
            sendInput();

            draw(
                ctx,
                worldWidth,
                worldHeight,
                gameState.puck,
                gameState.player,
                gameState.ai,
                gameState.playerScore,
                gameState.aiScore
            );

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);

        // Function for CleanUp
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            socket.close();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full bg-slate-900 rounded-2xl md:cursor-none"
        />
    );
}

function draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    puck: any,
    player: any,
    ai: any,
    playerScore: number,
    aiScore: number
) {
    ctx.clearRect(0, 0, w, h);
    drawTable(ctx, w, h);

    ctx.fillStyle = 'rgba(180, 150, 80, 0.25)';
    ctx.font = 'bold 100px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${playerScore}`, w / 4, h / 2 + 30);
    ctx.fillText(`${aiScore}`, (w * 3) / 4, h / 2 + 30);

    drawPlayer(ctx, player);
    drawAI(ctx, ai);
    drawPuck(ctx, puck);
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: any) {
    const { x, y, r } = player;

    ctx.shadowBlur = 24;
    ctx.shadowColor = '#00e5ff';

    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    gradient.addColorStop(0, '#e0ffff');
    gradient.addColorStop(0.35, '#00bcd4');
    gradient.addColorStop(0.75, '#006064');
    gradient.addColorStop(1, '#002a2e');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
}

function drawAI(ctx: CanvasRenderingContext2D, ai: any) {
    const { x, y, r } = ai;

    ctx.shadowBlur = 24;
    ctx.shadowColor = '#ff1744';

    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    gradient.addColorStop(0, '#fff5f5');
    gradient.addColorStop(0.35, '#ef9a9a');
    gradient.addColorStop(0.75, '#b71c1c');
    gradient.addColorStop(1, '#1a0000');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.arc(x - r * 0.28, y - r * 0.28, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
}

function drawPuck(ctx: CanvasRenderingContext2D, puck: any) {
    const { x, y, r } = puck;

    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ffd700';

    const gradient = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.05, x, y, r);
    gradient.addColorStop(0, '#fffde7');
    gradient.addColorStop(0.3, '#ffd54f');
    gradient.addColorStop(0.7, '#e65100');
    gradient.addColorStop(1, '#1a0a00');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.arc(x - r * 0.32, y - r * 0.32, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
}


function drawTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const GOAL_HEIGHT = h * 0.35;
    const goalTop = (h - GOAL_HEIGHT) / 2;

    ctx.strokeStyle = '#86869bff';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, w, h);

    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#9190c0ff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#635d7aff';
    ctx.fillRect(0, goalTop, 10, GOAL_HEIGHT);
    ctx.fillRect(w - 10, goalTop, 10, GOAL_HEIGHT);
    ctx.shadowBlur = 0;
}