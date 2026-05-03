import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { JWT_EXPIRES_IN_SECONDS, JWT_SECRET } from './auth.constants';
import { JwtPayload } from './auth.types';
import { encodeJwtSegment } from './auth.utils';

@Injectable()
export class JwtService {
  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const completePayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + JWT_EXPIRES_IN_SECONDS,
    };

    const header = encodeJwtSegment({ alg: 'HS256', typ: 'JWT' });
    const body = encodeJwtSegment(completePayload);
    const signature = this.createSignature(`${header}.${body}`);

    return `${header}.${body}.${signature}`;
  }

  verify(token: string): JwtPayload {
    const [header, body, signature] = token.split('.');

    if (!header || !body || !signature) {
      throw new UnauthorizedException('Gecersiz token yapisi.');
    }

    const expectedSignature = this.createSignature(`${header}.${body}`);

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Token imzasi gecersiz.');
    }

    try {
      const payload = JSON.parse(
        Buffer.from(body, 'base64url').toString('utf8'),
      ) as JwtPayload;

      if (payload.exp <= Math.floor(Date.now() / 1000)) {
        throw new UnauthorizedException('Token suresi dolmus.');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token icerigi okunamadi.');
    }
  }

  private createSignature(value: string): string {
    return createHmac('sha256', JWT_SECRET).update(value).digest('base64url');
  }
}
