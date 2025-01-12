import process from 'node:process';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';

import { AppModule } from './app.module';

const logger = new Logger();

async function bootstrap() {
	logger.log('Starting API...');
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

	const PORT = process.env.PORT || 3_000;

	const config = new DocumentBuilder()
		.setTitle('Geospatial Query System')
		.setDescription('API documentation for the Geospatial Query System')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document);
	logger.log(`Swagger is running on http://localhost:${PORT}/docs`);

	app.use(express.json({ limit: '10mb' }));
	await app.listen(PORT);
	logger.log(`Application is running on http://localhost:${PORT}`);
}

await bootstrap();
