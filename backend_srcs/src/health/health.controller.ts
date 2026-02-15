import { Controller, Get } from "@nestjs/common";
import { DiskHealthIndicator, HealthCheck, HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator, TypeOrmHealthIndicator } from "@nestjs/terminus";

@Controller('health')
export class HealthController
{
    constructor(
        private readonly health: HealthCheckService,
        private readonly http: HttpHealthIndicator,
        private readonly db: TypeOrmHealthIndicator,
        private readonly memory: MemoryHealthIndicator,
        private readonly disk: DiskHealthIndicator,
    ){}

    @Get()
    @HealthCheck()
    check()
    {
        return this.health.check([
            () => this.db.pingCheck('database'),

            () => this.http.pingCheck('google_auth', 'https://accounts.google.com'),
            () => this.http.pingCheck('github_auth', 'https://github.com'),
            () => this.http.pingCheck('intra_42_auth', 'https://api.intra.42.fr'),

            () => this.memory.checkHeap('heap_memory', 300*1024*1024),

            () => this.memory.checkRSS('rss_memory', 400*1024*1024),
            
            () => this.disk.checkStorage('disk_health', { thresholdPercent: 0.9, path: '/' })
        ]);
    }

}