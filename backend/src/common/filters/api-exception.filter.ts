import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorResponseBody = {
  statusCode: number;
  code: string;
  message: string;
  errors?: string[];
  timestamp: string;
  path: string;
  method: string;
};

const ERROR_CODE_BY_STATUS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICE_UNAVAILABLE',
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = this.buildErrorResponse(exception, request, status);

    response.status(status).json(responseBody);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
    status: number,
  ): ErrorResponseBody {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return this.createResponse(request, status, {
          code: this.getErrorCode(status),
          message: payload,
        });
      }

      if (payload && typeof payload === 'object') {
        const normalizedPayload = payload as {
          message?: string | string[];
          error?: string;
          errors?: string[];
          code?: string;
        };

        const errors = this.normalizeErrors(
          normalizedPayload.errors ?? normalizedPayload.message,
        );
        const message =
          typeof normalizedPayload.message === 'string'
            ? normalizedPayload.message
            : (normalizedPayload.error ?? 'Request failed.');

        return this.createResponse(request, status, {
          code: normalizedPayload.code ?? this.getErrorCode(status),
          message,
          errors,
        });
      }
    }

    if (exception instanceof Error) {
      return this.createResponse(request, status, {
        code: this.getErrorCode(status),
        message: exception.message,
      });
    }

    return this.createResponse(request, status, {
      code: this.getErrorCode(status),
      message: 'Beklenmeyen bir hata olustu.',
    });
  }

  private createResponse(
    request: Request,
    status: number,
    payload: {
      code: string;
      message: string;
      errors?: string[];
    },
  ): ErrorResponseBody {
    return {
      statusCode: status,
      code: payload.code,
      message: payload.message,
      ...(payload.errors?.length ? { errors: payload.errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      method: request.method,
    };
  }

  private normalizeErrors(value?: string | string[]): string[] | undefined {
    if (!value) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }

    return [value];
  }

  private getErrorCode(status: number): string {
    return ERROR_CODE_BY_STATUS[status] ?? 'INTERNAL_SERVER_ERROR';
  }
}
