import { Vector2 } from "./vector2.type";

export interface GameStateType 
{
    ballPosition: Vector2;
    ballVelocity: Vector2;
    ballSpeed: number;
    paddleLeft: Vector2;  
    paddleRight: Vector2; 
    score: { left: number; right: number };
    ballRadius: number;
    paddleRadius: number;
    elapsedTimeSeconds: number;
}