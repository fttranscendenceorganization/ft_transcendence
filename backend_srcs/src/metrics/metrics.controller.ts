import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusController } from '@willsoto/nestjs-prometheus';
import type { Response } from 'express';

@Controller('metrics')
export class MetricsController extends PrometheusController {
  @Get()
  async index(@Res() response: Response): Promise<string> {
    return super.index(response);
  }
}