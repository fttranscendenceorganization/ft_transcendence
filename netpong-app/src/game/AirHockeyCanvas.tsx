import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

// ---------------------------------------------------------------------------
// Types that match the BACKEND GameStateType exactly
// ---------------------------------------------------------------------------
type Vec2 = { x: number; y: number };

type BackendGameState = {
    ballPosition: Vec2;
    ballVelocity: Vec2;
    ballSpeed: number;
    paddleLeft: Vec2;
    paddleRight: Vec2;
    score: { left: number; right: number };
    ballRadius: number;
    paddleRadius: number;
    elapsedTimeSeconds: number;
};

// Internal canvas state (stays in the old draw-function shape your teammate wrote)
type DrawState = {
    puck: { x: number; y: number; r: number };
    player: { x: number; y: number; r: number };
    opponent: { x: number; y: number; r: number };
    playerScore: number;
    opponentScore: number;
};

// ---------------------------------------------------------------------------
// Backend world dimensions (fixed by the server physics)
// ---------------------------------------------------------------------------
const WORLD_W = 1000;
const WORLD_H = 600;

interface AirHockeyCanvasProps {
    /** Which side this client is on ('left' | 'right'), received from gameFound event */
    side: 'left' | 'right';
    /** The socket instance managed by GamePlay */
    socket: Socket;
    /** Called when the game ends */
    onGameOver: (data: { winnerId: string; score: { left: number; right: number } }) => void;
    /** Called when the game is aborted */
    onGameAborted: (data: { reason: string }) => void;
}

export default function AirHockeyCanvas({
    side,
    socket,
    onGameOver,
    onGameAborted,
}: AirHockeyCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let worldWidth = 0;
        let worldHeight = 0;

        // ---------------------------------------------------------------------------
        // Canvas resize — keeps aspect ratio of 1000:600
        // ---------------------------------------------------------------------------
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            worldWidth = rect.width;
            worldHeight = rect.height;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();
        window.addEventListener('resize', resize);

        // ---------------------------------------------------------------------------
        // Scale helpers — map backend 1000×600 → canvas pixels
        // ---------------------------------------------------------------------------
        const sx = (x: number) => (x / WORLD_W) * worldWidth;
        const sy = (y: number) => (y / WORLD_H) * worldHeight;
        const sr = (r: number) => (r / WORLD_W) * worldWidth; // scale radius by width

        // ---------------------------------------------------------------------------
        // Draw state initialised to center
        // ---------------------------------------------------------------------------
        let drawState: DrawState = {
            puck: { x: WORLD_W / 2, y: WORLD_H / 2, r: 25 },
            player: { x: side === 'left' ? 50 : 950, y: WORLD_H / 2, r: 45 },
            opponent: { x: side === 'left' ? 950 : 50, y: WORLD_H / 2, r: 45 },
            playerScore: 0,
            opponentScore: 0,
        };

        // ---------------------------------------------------------------------------
        // Mouse / touch input — send movePaddle in world coordinates
        // ---------------------------------------------------------------------------
        const mouse = { x: 0, y: 0 };

        const toWorldX = (canvasX: number) => (canvasX / worldWidth) * WORLD_W;
        const toWorldY = (canvasY: number) => (canvasY / worldHeight) * WORLD_H;

        const sendPaddleMove = () => {
            socket.emit('movePaddle', {
                x: toWorldX(mouse.x),
                y: toWorldY(mouse.y),
            });
        };

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouse.x = touch.clientX - rect.left;
            mouse.y = touch.clientY - rect.top;
        };

        // Keyboard fallback (WASD / arrows) — moves paddle incrementally
        const keys = { up: false, down: false, left: false, right: false };
        const KEYBOARD_SPEED = 8; // world units per frame

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

        // Track current paddle world position for keyboard input
        let paddleWorldX = side === 'left' ? 50 : 950;
        let paddleWorldY = WORLD_H / 2;

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // ---------------------------------------------------------------------------
        // Listen to backend gameState events
        // ---------------------------------------------------------------------------
        const handleGameState = (state: BackendGameState) => {
            const myPaddle = side === 'left' ? state.paddleLeft : state.paddleRight;
            const oppPaddle = side === 'left' ? state.paddleRight : state.paddleLeft;
            const myScore = side === 'left' ? state.score.left : state.score.right;
            const oppScore = side === 'left' ? state.score.right : state.score.left;

            // Keep keyboard-driven world position in sync with authoritative state
            paddleWorldX = myPaddle.x;
            paddleWorldY = myPaddle.y;

            drawState = {
                puck: {
                    x: sx(state.ballPosition.x),
                    y: sy(state.ballPosition.y),
                    r: sr(state.ballRadius),
                },
                player: {
                    x: sx(myPaddle.x),
                    y: sy(myPaddle.y),
                    r: sr(state.paddleRadius),
                },
                opponent: {
                    x: sx(oppPaddle.x),
                    y: sy(oppPaddle.y),
                    r: sr(state.paddleRadius),
                },
                playerScore: myScore,
                opponentScore: oppScore,
            };
        };

        socket.on('gameState', handleGameState);
        socket.on('gameOver', onGameOver);
        socket.on('gameAborted', onGameAborted);

        // ---------------------------------------------------------------------------
        // Render + input loop at ~60fps
        // ---------------------------------------------------------------------------
        let animId: number;

        const loop = () => {
            // Keyboard movement → emit
            if (keys.up) paddleWorldY = Math.max(0, paddleWorldY - KEYBOARD_SPEED);
            if (keys.down) paddleWorldY = Math.min(WORLD_H, paddleWorldY + KEYBOARD_SPEED);
            if (keys.left) paddleWorldX = Math.max(0, paddleWorldX - KEYBOARD_SPEED);
            if (keys.right) paddleWorldX = Math.min(WORLD_W, paddleWorldX + KEYBOARD_SPEED);

            const anyKey = keys.up || keys.down || keys.left || keys.right;
            if (anyKey) {
                socket.emit('movePaddle', { x: paddleWorldX, y: paddleWorldY });
            } else {
                sendPaddleMove(); // mouse / touch
            }

            draw(
                ctx,
                worldWidth,
                worldHeight,
                drawState.puck,
                drawState.player,
                drawState.opponent,
                drawState.playerScore,
                drawState.opponentScore
            );

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);

        // ---------------------------------------------------------------------------
        // Cleanup
        // ---------------------------------------------------------------------------
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            socket.off('gameState', handleGameState);
            socket.off('gameOver', onGameOver);
            socket.off('gameAborted', onGameAborted);
        };
    }, [side, socket, onGameOver, onGameAborted]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full bg-slate-900 rounded-2xl md:cursor-none"
        />
    );
}

// ===========================================================================
// Drawing functions — unchanged from your teammate's original work
// ===========================================================================

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

    // Opponent
    drawAI(ctx, ai);

    // Puck
    drawPuck(ctx, puck);
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: any) {
    const { x, y, r } = player;
    const glow = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    glow.addColorStop(0, '#6ee7b7');
    glow.addColorStop(1, '#064e3b');
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#22c55e';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawAI(ctx: CanvasRenderingContext2D, ai: any) {
    const { x, y, r } = ai;
    const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.1;
    const glow = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * pulse);
    glow.addColorStop(0, '#fecaca');
    glow.addColorStop(1, '#450a0a');
    ctx.shadowBlur = 35;
    ctx.shadowColor = '#ef4444';
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawPuck(ctx: CanvasRenderingContext2D, puck: any) {
    const { x, y, r } = puck;
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
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
