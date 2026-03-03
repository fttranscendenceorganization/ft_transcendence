import { Injectable } from '@nestjs/common';
import { Counter, Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
    constructor(
        @InjectMetric('auth_login_attempts_total') private authLoginAttempts: Counter<string>,
        @InjectMetric('chat_websocket_connections') private chatWsConnections: Gauge<string>,
        @InjectMetric('chat_messages_sent_total') private chatMessagesSent: Counter<string>,
        @InjectMetric('game_active_games') private gameActiveGames: Gauge<string>,
        @InjectMetric('game_queue_size') private gameQueueSize: Gauge<string>,
        @InjectMetric('game_completed_total') private gameCompleted: Counter<string>,
        @InjectMetric('user_registrations_total') private userRegistrations: Counter<string>,
    ) { }

    incrementLoginAttempt(method: string, status: 'success' | 'failure') {
        this.authLoginAttempts.inc({ method, status });
    }

    incrementWsConnections() { this.chatWsConnections.inc(); }
    decrementWsConnections() { this.chatWsConnections.dec(); }
    incrementMessagesSent() { this.chatMessagesSent.inc(); }

    incrementActiveGames() { this.gameActiveGames.inc(); }
    decrementActiveGames() { this.gameActiveGames.dec(); }
    incrementQueueSize() { this.gameQueueSize.inc(); }
    decrementQueueSize() { this.gameQueueSize.dec(); }
    incrementGamesCompleted() { this.gameCompleted.inc(); }


    incrementUserRegistrations() { this.userRegistrations.inc(); }
}