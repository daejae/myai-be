import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['api-key'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization api-key is missing');
    }

    const user = await this.validateToken(authHeader);
    if (!user) {
      throw new UnauthorizedException('Invalid api-key');
    }
    request.user = user;

    return true;
  }

  async validateToken(token: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        apiKey: token,
      },
    });

    if (!user) {
      return null;
    }

    return user;
  }
}
