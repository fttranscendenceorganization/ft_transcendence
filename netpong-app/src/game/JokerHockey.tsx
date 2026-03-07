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

interface JokerHockeyProps {
    side: 'left' | 'right';
    socket: Socket;
    onGameOver: (data: { winnerId: string; score: { left: number; right: number } }) => void;
    onGameAborted: (data: { reason: string }) => void;
}

export default function JokerHockey({
    side,
    socket,
    onGameOver,
    onGameAborted,
}: JokerHockeyProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let worldWidth = 0;
        let worldHeight = 0;

        let canvasRect = canvas.getBoundingClientRect();

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            worldWidth = rect.width;
            worldHeight = rect.height;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            canvasRect = canvas.getBoundingClientRect();
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

        const mouse = { x: 0, y: 0, dirty: false };

        const toWorldX = (canvasX: number) => (canvasX / worldWidth) * WORLD_W;
        const toWorldY = (canvasY: number) => (canvasY / worldHeight) * WORLD_H;

        const sendPaddleMove = () => {
            socket.emit('movePaddle', {
                x: toWorldX(mouse.x),
                y: toWorldY(mouse.y),
            });
        };

        const onMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX - canvasRect.left;
            mouse.y = e.clientY - canvasRect.top;
            mouse.dirty = true;
        };

        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            mouse.x = touch.clientX - canvasRect.left;
            mouse.y = touch.clientY - canvasRect.top;
            mouse.dirty = true;
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

        let renderState: DrawState = { ...drawState };
        const LERP_BALL = 0.8;
        const LERP_PADDLE = 0.4;
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const loop = () => {
            if (keys.up) paddleWorldY = Math.max(0, paddleWorldY - KEYBOARD_SPEED);
            if (keys.down) paddleWorldY = Math.min(WORLD_H, paddleWorldY + KEYBOARD_SPEED);
            if (keys.left) paddleWorldX = Math.max(0, paddleWorldX - KEYBOARD_SPEED);
            if (keys.right) paddleWorldX = Math.min(WORLD_W, paddleWorldX + KEYBOARD_SPEED);

            const anyKey = keys.up || keys.down || keys.left || keys.right;
            if (anyKey) {
                socket.emit('movePaddle', { x: paddleWorldX, y: paddleWorldY });
            } else if (mouse.dirty) {
                sendPaddleMove();
                mouse.dirty = false;
            }

            renderState.puck.x = lerp(renderState.puck.x, drawState.puck.x, LERP_BALL);
            renderState.puck.y = lerp(renderState.puck.y, drawState.puck.y, LERP_BALL);
            renderState.player.x = lerp(renderState.player.x, drawState.player.x, LERP_PADDLE);
            renderState.player.y = lerp(renderState.player.y, drawState.player.y, LERP_PADDLE);
            renderState.opponent.x = lerp(renderState.opponent.x, drawState.opponent.x, LERP_PADDLE);
            renderState.opponent.y = lerp(renderState.opponent.y, drawState.opponent.y, LERP_PADDLE);

            draw(
                ctx,
                worldWidth,
                worldHeight,
                renderState.puck,
                renderState.player,
                renderState.opponent,
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

    ctx.fillStyle = 'rgba(197, 8, 240, 0.2)';
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

    const gradient = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    gradient.addColorStop(0, '#d8b4fe');
    gradient.addColorStop(0.4, '#a855f7');
    gradient.addColorStop(0.8, '#6b21a8');
    gradient.addColorStop(1, '#2e1065');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + r * 0.1, r * 0.5, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y - r * 0.2, r * 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y - r * 0.2, r * 0.07, 0, Math.PI * 2);
    ctx.fill();
}

function drawOpponent(ctx: CanvasRenderingContext2D, opponent: any) {
    const { x, y, r } = opponent;

    const gradient = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    gradient.addColorStop(0, '#86efac');
    gradient.addColorStop(0.4, '#22c55e');
    gradient.addColorStop(0.8, '#166534');
    gradient.addColorStop(1, '#052e16');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + r * 0.2, r * 0.6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x - r * 0.3, y - r * 0.2, r * 0.18, r * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + r * 0.3, y - r * 0.2, r * 0.18, r * 0.12, 0.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawPuck(ctx: CanvasRenderingContext2D, puck: any) {
    const { x, y, r } = puck;

    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
    gradient.addColorStop(0, '#f5d0fe');
    gradient.addColorStop(0.3, '#c084fc');
    gradient.addColorStop(0.7, '#9333ea');
    gradient.addColorStop(1, '#3b0764');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(245, 208, 254, 0.3)';
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

function drawTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const GOAL_HEIGHT = h * 0.35;
    const goalTop = (h - GOAL_HEIGHT) / 2;

    ctx.strokeStyle = '#e900f9';
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

    ctx.fillStyle = '#d70707';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#860422';
    ctx.fillRect(0, goalTop, 10, GOAL_HEIGHT);
    ctx.fillRect(w - 10, goalTop, 10, GOAL_HEIGHT);
    ctx.shadowBlur = 0;
}