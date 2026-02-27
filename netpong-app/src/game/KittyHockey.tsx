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

interface KittyHockeyProps {
    side: 'left' | 'right';
    socket: Socket;
    onGameOver: (data: { winnerId: string; score: { left: number; right: number } }) => void;
    onGameAborted: (data: { reason: string }) => void;
}

export default function KittyHockey({
    side,
    socket,
    onGameOver,
    onGameAborted,
}: KittyHockeyProps) {
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
                drawState.opponentScore,
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
            className="w-full h-full bg-black rounded-2xl md:cursor-none"
        />
    );
}

 
function draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    puck: any,
    player: any,
    opponent: any,
    playerScore: number,
    opponentScore: number,
) {
    ctx.clearRect(0, 0, w, h);
    drawTable(ctx, w, h);

    ctx.fillStyle = 'rgba(245, 8, 194, 0.41)';
    ctx.font = 'bold 80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${playerScore}`, w / 4, h / 2 + 30);
    ctx.fillText(`${opponentScore}`, (w * 3) / 4, h / 2 + 30);

    drawPlayer(ctx, player);
    drawOpponent(ctx, opponent);
    drawPuck(ctx, puck);
}

 

function drawPlayer(ctx: CanvasRenderingContext2D, player: any) {
    const { x, y, r } = player;

    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
    gradient.addColorStop(0, '#f61d05ff');
    gradient.addColorStop(0.4, '#e27725ff');
    gradient.addColorStop(0.8, '#e78c15ff');
    gradient.addColorStop(1, '#ed940fff');

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff4db8';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff4db8';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff4db8';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.55, y - r * 0.7);
    ctx.lineTo(x - r * 0.75, y - r * 1.1);
    ctx.lineTo(x - r * 0.25, y - r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.55, y - r * 0.7);
    ctx.lineTo(x + r * 0.75, y - r * 1.1);
    ctx.lineTo(x + r * 0.25, y - r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffd6ec';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.55, y - r * 0.75);
    ctx.lineTo(x - r * 0.68, y - r * 1.0);
    ctx.lineTo(x - r * 0.32, y - r * 0.88);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.55, y - r * 0.75);
    ctx.lineTo(x + r * 0.68, y - r * 1.0);
    ctx.lineTo(x + r * 0.32, y - r * 0.88);
    ctx.closePath();
    ctx.fill();
}

function drawOpponent(ctx: CanvasRenderingContext2D, opponent: any) {
    const { x, y, r } = opponent;

    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.4, '#ffc1e3');
    gradient.addColorStop(0.8, '#ff80c8');
    gradient.addColorStop(1, '#d81b90');

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff80c8';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff80c8';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff80c8';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.55, y - r * 0.7);
    ctx.lineTo(x - r * 0.75, y - r * 1.1);
    ctx.lineTo(x - r * 0.25, y - r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.55, y - r * 0.7);
    ctx.lineTo(x + r * 0.75, y - r * 1.1);
    ctx.lineTo(x + r * 0.25, y - r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffe4f3';
    ctx.beginPath();
    ctx.moveTo(x - r * 0.55, y - r * 0.75);
    ctx.lineTo(x - r * 0.68, y - r * 1.0);
    ctx.lineTo(x - r * 0.32, y - r * 0.88);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.55, y - r * 0.75);
    ctx.lineTo(x + r * 0.68, y - r * 1.0);
    ctx.lineTo(x + r * 0.32, y - r * 0.88);
    ctx.closePath();
    ctx.fill();
}

function drawPuck(ctx: CanvasRenderingContext2D, puck: any) {
    const { x, y, r } = puck;

    const gradient = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#ffb3e6');
    gradient.addColorStop(0.7, '#ff4db8');
    gradient.addColorStop(1, '#ad1457');

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff4db8';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
}

function drawTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const GOAL_HEIGHT = h * 0.35;
    const goalTop = (h - GOAL_HEIGHT) / 2;

    ctx.strokeStyle = '#f518c8';
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

    ctx.fillStyle = '#eb6cba';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#f132bf';
    ctx.fillRect(0, goalTop, 10, GOAL_HEIGHT);
    ctx.fillRect(w - 10, goalTop, 10, GOAL_HEIGHT);
    ctx.shadowBlur = 0;
}