import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';
import { JWT_SECRET } from './auth.constants';
import { AuthenticatedUser, JwtPayload } from './auth.types';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    } satisfies StrategyOptions);
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Token tipi gecersiz.');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
