import { useEffect, useRef } from 'react';

type Vec2 = { x: number; y: number }; // Creation of a type of a 2D vector (act as a bluePrint)

type GameState = {
    puck: { x: number; y: number; r: number };
    player: { x: number; y: number; r: number };
    ai: { x: number; y: number; r: number };
    playerScore: number;
    aiScore: number;
}; // Same Create a bluePrint for the Game state (Need to be respected)

export default function AirHockeyCanvas() {
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

// Rendering function
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

    // Scoreboard
    ctx.fillStyle = 'rgba(238, 11, 11, 0.2)';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${playerScore}`, w / 4, h / 2 + 30);
    ctx.fillText(`${aiScore}`, (w * 3) / 4, h / 2 + 30);

    // Player
    drawPlayer(ctx, player);

    // AI
    drawAI(ctx, ai);

    // Puck
    drawPuck(ctx, puck);
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: any) {
    const { x, y, r } = player;

    const mainGlow = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    mainGlow.addColorStop(0, '#dcfce7');
    mainGlow.addColorStop(0.3, '#86efac');
    mainGlow.addColorStop(0.6, '#22c55e');
    mainGlow.addColorStop(0.85, '#166534');
    mainGlow.addColorStop(1, '#052e16');

    ctx.fillStyle = mainGlow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x + Math.cos(angle) * r * 0.8,
            y + Math.sin(angle) * r * 0.8
        );
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#f0fdf4';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#166534';
    for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 * i) / 3;
        ctx.beginPath();
        ctx.arc(
            x + Math.cos(angle) * r * 0.4,
            y + Math.sin(angle) * r * 0.4,
            r * 0.15,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function drawAI(ctx: CanvasRenderingContext2D, ai: any) {
    const { x, y, r } = ai;

    const mainGlow = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    mainGlow.addColorStop(0, '#fca5a5');
    mainGlow.addColorStop(0.3, '#ef4444');
    mainGlow.addColorStop(0.6, '#b91c1c');
    mainGlow.addColorStop(0.85, '#7f1d1d');
    mainGlow.addColorStop(1, '#450a0a');

    ctx.fillStyle = mainGlow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7f1d1d';
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const distance = r * 0.6;
        ctx.beginPath();
        ctx.arc(
            x + Math.cos(angle) * distance,
            y + Math.sin(angle) * distance,
            r * 0.08,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    const eyeOffset = r * 0.3;
    ctx.fillStyle = '#fef2f2';

    ctx.beginPath();
    ctx.arc(x - eyeOffset, y, r * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + eyeOffset, y, r * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.arc(x - eyeOffset, y, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + eyeOffset, y, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
}

function drawPuck(ctx: CanvasRenderingContext2D, puck: any) {
    const { x, y, r } = puck;

    const mainGlow = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
    mainGlow.addColorStop(0, '#f0fdf4');
    mainGlow.addColorStop(0.2, '#bbf7d0');
    mainGlow.addColorStop(0.5, '#4ade80');
    mainGlow.addColorStop(0.75, '#22c55e');
    mainGlow.addColorStop(0.9, '#166534');
    mainGlow.addColorStop(1, '#14532d');

    ctx.fillStyle = mainGlow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#14532d';
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, r * 0.9, angle, angle + Math.PI / 12);
        ctx.closePath();
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#14532d';
    for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 * i) / 3;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(r * 0.25, 0);
        ctx.quadraticCurveTo(r * 0.5, -r * 0.15, r * 0.6, 0);
        ctx.quadraticCurveTo(r * 0.5, r * 0.15, r * 0.25, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.arc(r * 0.55, 0, r * 0.12, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
    ctx.fillStyle = '#86efac';
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 4; i++) {
        const dripAngle = (Math.PI * 2 * i) / 4;
        const dripDist = r * 1.1;
        ctx.beginPath();
        ctx.arc(
            x + Math.cos(dripAngle) * dripDist,
            y + Math.sin(dripAngle) * dripDist,
            r * 0.1,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function drawTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const GOAL_HEIGHT = h * 0.35;
    const goalTop = (h - GOAL_HEIGHT) / 2;

    ctx.strokeStyle = '#173c1e';
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

    ctx.fillStyle = '#ec2f0d';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ec2f0d';
    ctx.fillRect(0, goalTop, 10, GOAL_HEIGHT);
    ctx.fillRect(w - 10, goalTop, 10, GOAL_HEIGHT);
    ctx.shadowBlur = 0;
}
