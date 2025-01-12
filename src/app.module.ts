import process from 'node:process';

import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { STATES, type Connection } from 'mongoose';

import { CityModule } from './city/city.module';

const logger = new Logger('AppModule');

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		CityModule,
		MongooseModule.forRoot(process.env.MONGO_URI, {
			connectionName: 'tec',
			connectionFactory: (connection: Connection) => {
				connection.on('connected', () => {
					logger.log('TEC DB connected');
				});
				connection.on('disconnected', () => {
					logger.log('TEC DB disconnected');
				});
				connection.on('error', (error) => {
					logger.log(`TEC DB connection failed! Error: ${error}`);
				});

				logger.log(`TEC DB ${STATES[connection.readyState]}`);
				return connection;
			},
		}),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
