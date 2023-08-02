import { ConfigService } from '@nestjs/config';

export function getJWTConfig(): any {
  return {
    useFactory: (configService: ConfigService) => ({
      secret: configService.get('JWT_SECRET'),
      accessTokenTtl: configService.get('JWT_TOKEN_TTL'),
      global: true,
    }),
    inject: [ConfigService],
  };
}
