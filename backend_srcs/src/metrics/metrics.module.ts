import { Module } from '@nestjs/common';
import {
    PrometheusModule,
    makeCounterProvider,
    makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';

@Module({
    imports: [
        PrometheusModule.register({
            path: '/metrics',
            defaultMetrics: { enabled: true },
        }),
    ],
    providers: [
        MetricsService,
        makeCounterProvider({
            name: 'auth_login_attempts_total',
            help: 'Total login attempts',
            labelNames: ['method', 'status'],
        }),
        makeGaugeProvider({
            name: 'chat_websocket_connections',
            help: 'Active WebSocket connections in chat',
        }),
        makeCounterProvider({
            name: 'chat_messages_sent_total',
            help: 'Total messages sent in chat',
        }),
        makeGaugeProvider({
            name: 'game_active_games',
            help: 'Currently active games',
        }),
        makeGaugeProvider({
            name: 'game_queue_size',
            help: 'Players currently in matchmaking queue',
        }),
        makeCounterProvider({
            name: 'game_completed_total',
            help: 'Total completed games',
        }),
        makeCounterProvider({
            name: 'user_registrations_total',
            help: 'Total user registrations',
        }),
    ],
    exports: [MetricsService],
})
export class MetricsModule { }