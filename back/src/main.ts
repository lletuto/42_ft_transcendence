import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.enableCors({ origin: true, credentials: true });
	app.useGlobalPipes(new ValidationPipe());
	app.use(cookieParser());
	app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
	await app.listen(3000, '0.0.0.0');}
bootstrap();
