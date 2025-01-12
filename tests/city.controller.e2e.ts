import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { BoundaryDto } from '../src/city/dto/boundary.dto';
import { CreateDocumentDto } from '../src/city/dto/create-document.dto';
import { DeleteDocumentDto } from '../src/city/dto/delete-document.dto';
import { UpdateDocumentDto } from '../src/city/dto/update-document.dto';

describe('CityController (E2E)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();

		app.useGlobalPipes(
			new ValidationPipe({
				transform: true,
				whitelist: true,
				forbidNonWhitelisted: true,
			}),
		);

		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('GET /city/:cityName', () => {
		it('should fetch a city by name', async () => {
			const cityName = 'Mumbai';
			const response = await request(app.getHttpServer()).get(`/city/${cityName}`).expect(200);

			expect(response.body).toHaveProperty('name', cityName);
		});

		it('should return 404 if the city is not found', async () => {
			const cityName = 'UnknownCity';
			const response = await request(app.getHttpServer()).get(`/city/${cityName}`).expect(404);

			expect(response.body).toHaveProperty('message', expect.any(String));
		});
	});

	describe('POST /city/documents/create', () => {
		it('should create a document within the city boundary', async () => {
			const createDocumentDto: CreateDocumentDto = {
				name: 'Infiniti Mall',
				type: 'business',
				location: {
					type: 'Point',
					coordinates: [72.830_903_356_580_65, 19.141_336_5],
				},
			};

			const response = await request(app.getHttpServer())
				.post('/city/documents/create')
				.send(createDocumentDto)
				.expect(201);

			expect(response.body).toHaveProperty('name', createDocumentDto.name);
		});

		it('should return 400 for invalid document data', async () => {
			const invalidDocumentDto = {
				name: 'infiniti Mall',
				type: 'business',
				location: {},
			};

			const response = await request(app.getHttpServer())
				.post('/city/documents/create')
				.send(invalidDocumentDto)
				.expect(400);

			expect(response.body).toHaveProperty('message', expect.any(Array));
		});
	});

	describe('POST /city/documents/find', () => {
		it('should fetch documents within city boundary', async () => {
			const boundaryDto: BoundaryDto = {
				type: 'Polygon',
				coordinates: [
					[
						[72.829_5, 19.141],
						[72.832_5, 19.141],
						[72.832_5, 19.143],
						[72.829_5, 19.143],
						[72.829_5, 19.141],
					],
				],
			};

			const response = await request(app.getHttpServer()).post('/city/documents/find').send(boundaryDto).expect(201);

			expect(Array.isArray(response.body)).toBe(true);
		});

		it('should return 404 if no documents are found', async () => {
			const boundaryDto: BoundaryDto = {
				type: 'Polygon',
				coordinates: [
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1],
						[0, 0],
					],
				],
			};

			const response = await request(app.getHttpServer()).get('/city/documents/find').send(boundaryDto).expect(404);

			expect(response.body).toHaveProperty('message', expect.any(String));
		});
	});

	describe('PUT /city/documents/update', () => {
		it('should update a document', async () => {
			const updateDocumentDto: UpdateDocumentDto = {
				oldLocation: {
					type: 'Point',
					coordinates: [72.830_903_356_580_65, 19.141_336_5],
				},
				newLocation: {
					type: 'Point',
					coordinates: [72.833_547_1, 19.185_629_6],
				},
			};

			const response = await request(app.getHttpServer())
				.put('/city/documents/update')
				.send(updateDocumentDto)
				.expect(200);

			expect(response.body).toHaveProperty('success', true);
		});

		it('should return 400 for invalid update data', async () => {
			const invalidUpdateDto = {
				oldLocation: {
					type: 'Point',
					coordinates: [0, 1],
				},
			};

			const response = await request(app.getHttpServer())
				.put('/city/documents/update')
				.send(invalidUpdateDto)
				.expect(400);

			expect(response.body).toHaveProperty('message', expect.any(Array));
		});
	});

	describe('DELETE /city/documents/delete', () => {
		it('should delete a document', async () => {
			const deleteDocumentDto: DeleteDocumentDto = {
				boundary: {
					type: 'Polygon',
					coordinates: [
						[
							[72.832, 19.184],
							[72.835, 19.184],
							[72.835, 19.187],
							[72.832, 19.187],
							[72.832, 19.184],
						],
					],
				},
			};

			const response = await request(app.getHttpServer())
				.delete('/city/documents/delete')
				.send(deleteDocumentDto)
				.expect(200);

			expect(response.body).toHaveProperty('success', true);
		});

		it('should return 400 if the document cannot be deleted', async () => {
			const invalidDeleteDto = {
				boundary: {
					type: 'Polygon',
					coordinates: [
						[
							[0, 1],
							[1, 2],
							[2, 3],
							[0, 1],
						],
					],
				},
			};

			const response = await request(app.getHttpServer())
				.delete('/city/documents/delete')
				.send(invalidDeleteDto)
				.expect(400);

			expect(response.body).toHaveProperty('message', expect.any(String));
		});
	});
});
