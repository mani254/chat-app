import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '@org/dal';
import { Socket } from 'socket.io';
import { auth } from '../../auth/better-auth.config';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly userRepository: UserRepository) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    return this.validateSocket(client);
  }

  async validateSocket(client: Socket): Promise<boolean> {
    try {
      const handshake = client.handshake;
      const token =
        handshake.auth?.['token'] ||
        handshake.headers?.['authorization']?.replace('Bearer ', '') ||
        handshake.query?.['token'];


      if (!token || typeof token !== 'string') {
        this.logger.warn(`[WsAuthGuard] Missing session token on socket connection ${client.id}`);
        return false;
      }

      const headers = new Headers();
      headers.append('authorization', `Bearer ${token}`);
      if (handshake.headers.cookie) {
        headers.append('cookie', handshake.headers.cookie);
      }

      const session = await auth.api.getSession({ headers });

      if (!session?.user?.email) {
        this.logger.warn(`[WsAuthGuard] Invalid or expired session for socket ${client.id}`);
        return false;
      }

      const userEntity = await this.userRepository.findByEmail(session.user.email);
      if (!userEntity) {
        return false;
      }

      // Attach user entity to socket client data
      client.data.user = userEntity;
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[WsAuthGuard] Socket authentication error: ${msg}`);
      return false;
    }
  }
}
