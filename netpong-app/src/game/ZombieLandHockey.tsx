import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

 
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

type DrawState = {
    puck: { x: number; y: number; r: number };
    player: { x: number; y: number; r: number };
    opponent: { x: number; y: number; r: number };
    playerScore: number;
    opponentScore: number;
};

 
const WORLD_W = 1000;
const WORLD_H = 600;

 
const BALL_RADIUS = 25;
const PADDLE_RADIUS = 45;

interface ZombieLandHockeyProps {
    side: 'left' | 'right';
    socket: Socket;
    onGameOver: (data: { winnerId: string; score: { left: number; right: number } }) => void;
    onGameAborted: (data: { reason: string }) => void;
}

export default function ZombieLandHockey({
    side,
    socket,
    onGameOver,
    onGameAborted,
}: ZombieLandHockeyProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let worldWidth = 0;
        let worldHeight = 0;

        
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

        
        const sx = (x: number) => (x / WORLD_W) * worldWidth;
        const sy = (y: number) => (y / WORLD_H) * worldHeight;
        const sr = (r: number) => (r / WORLD_W) * worldWidth;

        
        let drawState: DrawState = {
            puck: { x: sx(WORLD_W / 2), y: sy(WORLD_H / 2), r: sr(BALL_RADIUS) },
            player: {
                x: sx(side === 'left' ? PADDLE_RADIUS : WORLD_W - PADDLE_RADIUS),
                y: sy(WORLD_H / 2),
                r: sr(PADDLE_RADIUS),
            },
            opponent: {
                x: sx(side === 'left' ? WORLD_W - PADDLE_RADIUS : PADDLE_RADIUS),
                y: sy(WORLD_H / 2),
                r: sr(PADDLE_RADIUS),
            },
            playerScore: 0,
            opponentScore: 0,
        };

        
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

        
        const keys = { up: false, down: false, left: false, right: false };
        const KEYBOARD_SPEED = 16;

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

        let paddleWorldX = side === 'left' ? 50 : 950;
        let paddleWorldY = WORLD_H / 2;

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        
        const handleGameState = (state: BackendGameState) => {
            const myPaddle = side === 'left' ? state.paddleLeft : state.paddleRight;
            const oppPaddle = side === 'left' ? state.paddleRight : state.paddleLeft;

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
                playerScore: state.score.left,
                opponentScore: state.score.right,
            };
        };

        socket.on('gameState', handleGameState);
        socket.on('gameOver', onGameOver);
        socket.on('gameAborted', onGameAborted);

        
        let animId: number;

        const loop = () => {
            if (keys.up) paddleWorldY = Math.max(0, paddleWorldY - KEYBOARD_SPEED);
            if (keys.down) paddleWorldY = Math.min(WORLD_H, paddleWorldY + KEYBOARD_SPEED);
            if (keys.left) paddleWorldX = Math.max(0, paddleWorldX - KEYBOARD_SPEED);
            if (keys.right) paddleWorldX = Math.min(WORLD_W, paddleWorldX + KEYBOARD_SPEED);

            const anyKey = keys.up || keys.down || keys.left || keys.right;
            if (anyKey) {
                socket.emit('movePaddle', { x: paddleWorldX, y: paddleWorldY });
            } else {
                sendPaddleMove();
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

    
    ctx.fillStyle = 'rgba(238, 11, 11, 0.2)';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${playerScore}`, w / 4, h / 2 + 30);
    ctx.fillText(`${aiScore}`, (w * 3) / 4, h / 2 + 30);

    drawPlayer(ctx, player);
    drawAI(ctx, ai);
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