import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extracts current user ID from:
 * 1. 'x-user-id' header (for direct testing and simulated auth)
 * 2. 'Authorization' token payload if populated by AuthGuard
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const headerUserId = request.headers['x-user-id'];
    if (typeof headerUserId === 'string' && headerUserId.trim().length > 0) {
      return headerUserId.trim();
    }

    const user = (request as unknown as { user?: { id?: string } }).user;
    if (user?.id) {
      return user.id;
    }

    return undefined;
  },
);
