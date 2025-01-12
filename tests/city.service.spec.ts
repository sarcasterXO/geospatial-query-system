import { BadRequestException, NotFoundException } from '@nestjs/common';
import { type Model } from 'mongoose';

import { CityService } from '../src/city/city.service';
import { type ICity } from '../src/city/schemas/city.schema';
import { type IDocument } from '../src/city/schemas/document.schema';

const mockCityModel = {
	findOne: vi.fn(),
	exists: vi.fn(),
};
const mockDocumentModel = {
	find: vi.fn(),
	create: vi.fn(),
	findOne: vi.fn(),
	exists: vi.fn(),
	updateOne: vi.fn(),
	deleteOne: vi.fn(),
};

let cityService: CityService;

beforeEach(() => {
	cityService = new CityService(
		mockCityModel as unknown as Model<ICity>,
		mockDocumentModel as unknown as Model<IDocument>,
	);
});

describe('CityService', () => {
	describe('findCityByName', () => {
		it('should return a city when found', async () => {
			const mockCity = { name: 'Test City' };
			mockCityModel.findOne.mockReturnValueOnce({
				lean: () => ({
					exec: () => Promise.resolve(mockCity),
				}),
			});

			const result = await cityService.findCityByName('Test City');
			expect(result).toEqual(mockCity);
			expect(mockCityModel.findOne).toHaveBeenCalledWith({
				// eslint-disable-next-line prefer-regex-literals
				name: new RegExp('^Test City$', 'gi'),
			});
		});

		it('should throw NotFoundException if city is not found', async () => {
			mockCityModel.findOne.mockReturnValueOnce({
				lean: () => ({
					exec: () => Promise.resolve(null),
				}),
			});

			await expect(cityService.findCityByName('Unknown City')).rejects.toThrow(NotFoundException);
		});
	});

	describe('findDocumentsByCityBoundary', () => {
		it('should return documents within the city boundary', async () => {
			const mockDocuments = [{ name: 'Doc 1' }, { name: 'Doc 2' }];
			mockDocumentModel.find.mockReturnValueOnce({
				lean: () => ({
					exec: () => Promise.resolve(mockDocuments),
				}),
			});

			const result = await cityService.findDocumentsByCityBoundary({
				type: 'Polygon',
				coordinates: [],
			});
			expect(result).toEqual(mockDocuments);
			expect(mockDocumentModel.find).toHaveBeenCalledWith({
				location: { $geoWithin: { $geometry: { type: 'Polygon', coordinates: [] } } },
			});
		});

		it('should throw NotFoundException if no documents are found', async () => {
			mockDocumentModel.find.mockReturnValueOnce({
				lean: () => ({
					exec: () => Promise.resolve([]),
				}),
			});

			await expect(cityService.findDocumentsByCityBoundary({ type: 'Polygon', coordinates: [] })).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('createDocumentInCityByName', () => {
		it('should create a document within a city boundary', async () => {
			const mockDto = {
				name: 'Doc 1',
				location: { type: 'Point', coordinates: [0, 0] },
			};

			mockCityModel.exists.mockResolvedValueOnce(true);
			mockDocumentModel.create.mockResolvedValueOnce(mockDto);

			const result = await cityService.createDocumentInCity(mockDto as any);
			expect(result).toEqual(mockDto);
			expect(mockCityModel.exists).toHaveBeenCalledWith({
				boundary: { $geoIntersects: { $geometry: mockDto.location } },
			});
			expect(mockDocumentModel.create).toHaveBeenCalledWith(mockDto);
		});

		it('should throw BadRequestException if location is invalid', async () => {
			const invalidDto = {
				name: 'Invalid Doc',
				location: { type: 'InvalidType', coordinates: [] },
			};

			await expect(cityService.createDocumentInCity(invalidDto as any)).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException if location is outside city boundary', async () => {
			const mockDto = {
				name: 'Doc 1',
				location: { type: 'Point', coordinates: [0, 0] },
			};

			mockCityModel.exists.mockResolvedValueOnce(false);

			await expect(cityService.createDocumentInCity(mockDto as any)).rejects.toThrow(BadRequestException);
		});
	});

	describe('updateDocumentInCityByName', () => {
		it('should update a document within a city boundary', async () => {
			const mockDto = {
				oldLocation: { type: 'Point', coordinates: [0, 0] },
				newLocation: { type: 'Point', coordinates: [1, 1] },
			};
			const mockCity = {
				boundary: {
					type: 'Polygon',
					coordinates: [
						[
							[0, 0],
							[1, 1],
							[1, 2],
							[0, 0],
						],
					],
				},
			};
			const mockDocument = {
				_id: '123tec321',
				name: 'Test Document',
				location: { type: 'Point', coordinates: [0, 0] },
			};

			mockDocumentModel.findOne.mockReturnValueOnce({
				select: () => ({
					lean: () => ({
						exec: () => Promise.resolve(mockDocument),
					}),
				}),
			});
			mockCityModel.findOne.mockReturnValueOnce({
				lean: () => ({
					exec: () => Promise.resolve(mockCity),
				}),
			});
			mockCityModel.exists.mockResolvedValueOnce(true);

			const result = await cityService.updateDocumentInCity(mockDto as any);
			expect(result).toEqual({ success: true });
			expect(mockDocumentModel.updateOne).toHaveBeenCalledWith(
				{ _id: mockDocument._id },
				{
					$set: { location: mockDto.newLocation },
				},
			);
		});

		it('should throw NotFoundException if document is not found', async () => {
			mockDocumentModel.findOne.mockReturnValueOnce({
				select: () => ({
					lean: () => ({
						exec: () => Promise.resolve(null),
					}),
				}),
			});

			const mockDto = {
				oldLocation: { type: 'Point', coordinates: [2, 3] },
				newLocation: { type: 'Point', coordinates: [1, 1] },
			};

			await expect(cityService.updateDocumentInCity(mockDto as any)).rejects.toThrow(NotFoundException);

			expect(mockDocumentModel.findOne).toHaveBeenCalledWith({
				location: mockDto.oldLocation,
			});
		});

		it('should throw BadRequestException if updated location is outside the city boundary', async () => {
			const mockDto = {
				oldLocation: { type: 'Point', coordinates: [0, 0] },
				newLocation: { type: 'Point', coordinates: [1, 1] },
			};

			mockDocumentModel.findOne.mockReturnValueOnce({
				select: () => ({
					lean: () => ({
						exec: () =>
							Promise.resolve({
								location: mockDto.oldLocation,
							}),
					}),
				}),
			});

			mockCityModel.findOne.mockReturnValueOnce({
				lean: () => ({
					exec: () => Promise.resolve({ boundary: { $geoIntersects: { $geometry: mockDto.newLocation } } }),
				}),
			});

			mockCityModel.exists.mockResolvedValueOnce(false);

			await expect(cityService.updateDocumentInCity(mockDto)).rejects.toThrowError(
				new BadRequestException('Updated location is outside the city boundary'),
			);
		});
	});

	describe('deleteDocumentInCityByName', () => {
		it('should delete a document within the city boundary', async () => {
			const mockDto = {
				boundary: {
					type: 'Polygon',
					coordinates: [
						[
							[0, 0],
							[1, 1],
							[1, 2],
							[0, 0],
						],
					],
				},
			};

			mockDocumentModel.exists.mockResolvedValueOnce(true);
			mockDocumentModel.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

			const result = await cityService.deleteDocumentInCity(mockDto as any);
			expect(result).toEqual({ success: true });
			expect(mockDocumentModel.deleteOne).toHaveBeenCalledWith({
				location: { $geoWithin: { $geometry: mockDto.boundary } },
			});
		});

		it('should throw BadRequestException if document is outside the city boundary', async () => {
			const mockDto = {
				boundary: { type: 'Polygon', coordinates: [] },
			};

			mockDocumentModel.exists.mockResolvedValueOnce(false);

			await expect(cityService.deleteDocumentInCity(mockDto as any)).rejects.toThrow(BadRequestException);
		});
	});
});
