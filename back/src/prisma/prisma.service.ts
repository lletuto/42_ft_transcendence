//We will import the export of different package, the class client (that we just created)from prisma and package from nestjs/common 

import {	Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {	PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy{
	async onModuleInit()
	{
		await this.$connect();
	}
	async onModuleDestroy()
	{
		await this.$disconnect();
	}

}