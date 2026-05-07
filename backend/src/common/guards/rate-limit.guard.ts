import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly windowMs = this.getNumberEnv('RATE_LIMIT_WINDOW_MS', 60_000);
  private readonly maxRequests = this.getNumberEnv('RATE_LIMIT_MAX', 120);

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const now = Date.now();
    const key = this.buildKey(request);
    const current = this.store.get(key);

    if (!current || current.resetAt <= now) {
      const resetAt = now + this.windowMs;
      this.store.set(key, { count: 1, resetAt });
      this.applyHeaders(response, 1, resetAt);
      this.pruneStore(now);
      return true;
    }

    current.count += 1;
    this.applyHeaders(response, current.count, current.resetAt);

    if (current.count > this.maxRequests) {
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          message:
            'Cok fazla istek gonderdiniz. Lutfen daha sonra tekrar deneyin.',
          errors: [
            `Bu rota icin ${this.windowMs / 1000} saniyede en fazla ${this.maxRequests} istek gonderebilirsiniz.`,
          ],
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private buildKey(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const sourceIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0];
    const ip = sourceIp?.trim() || request.ip || 'unknown';

    return `${request.method}:${request.path}:${ip}`;
  }

  private applyHeaders(
    response: Response,
    count: number,
    resetAt: number,
  ): void {
    response.setHeader('X-RateLimit-Limit', String(this.maxRequests));
    response.setHeader(
      'X-RateLimit-Remaining',
      String(Math.max(this.maxRequests - count, 0)),
    );
    response.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
    response.setHeader(
      'Retry-After',
      String(Math.max(Math.ceil((resetAt - Date.now()) / 1000), 0)),
    );
  }

  private pruneStore(now: number): void {
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }

  private getNumberEnv(name: string, fallback: number): number {
    const raw = process.env[name];
    const parsed = Number(raw);

    if (!raw || Number.isNaN(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }
}
