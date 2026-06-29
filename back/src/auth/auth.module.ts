import { Module } from '@nestjs/common';
import {AuthController} from './auth.controller'
import {AuthService} from './auth.service'
import { PrismaModule } from 'src/prisma/prisma.module';
import {JwtModule} from '@nestjs/jwt'
import { GuardJwt } from './guards/jwt.guards';
import { RefreshGuard } from './guards/refresh.guards';


@Module({
	controllers: [AuthController],
	providers: [AuthService, GuardJwt, RefreshGuard],
	imports: [PrismaModule, JwtModule.register({secret: process.env.JWT_SECRET})],
	exports: [GuardJwt, JwtModule],
})
export class AuthModule {}