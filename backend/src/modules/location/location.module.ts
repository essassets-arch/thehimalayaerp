import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { LocationGateway } from './location.gateway';
import { PrismaModule } from '../../database/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret =
          configService.get<string>('jwt.accessSecret') || 'secret';
        const expiresIn = (configService.get<string>('jwt.accessExpiresIn') ||
          '15m') as unknown as number;
        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationGateway],
  exports: [LocationService],
})
export class LocationModule {}
