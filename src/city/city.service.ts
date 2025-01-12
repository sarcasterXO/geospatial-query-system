import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { validateMultiPolygon, validatePoint, validatePolygon } from 'src/util/GeoJSONValidator';

import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { type ICity, CitySchemaName } from './schemas/city.schema';
import { type IDocument, DocumentSchemaName } from './schemas/document.schema';

import type { BoundaryDto } from './dto/boundary.dto';
import type { DeleteDocumentDto } from './dto/delete-document.dto';
import type { LocationDto } from './dto/location.dto';

enum LocationType {
	MultiPolygon = 'MultiPolygon',
	Point = 'Point',
	Polygon = 'Polygon',
}

@Injectable()
export class CityService {
	constructor(
		@InjectModel(CitySchemaName, 'tec')
		private readonly cityModel: Model<ICity>,
		@InjectModel(DocumentSchemaName, 'tec')
		private readonly documentModel: Model<IDocument>,
	) {}

	/**
	 * Fetches a city by name.
	 * @param cityName The name of the city
	 * @returns The city document
	 */
	async findCityByName(cityName: string): Promise<ICity> {
		const city = await this.cityModel
			.findOne({ name: new RegExp(`^${cityName}$`, 'gi') })
			.lean()
			.exec();
		if (!city) throw new NotFoundException(`City with name "${cityName}" not found`);

		return city;
	}

	/**
	 * Fetches all documents that fall within a specified city boundary.
	 * @param cityBoundary The boundary of the city
	 * @returns A list of documents within the city boundary
	 */
	async findDocumentsByCityBoundary(cityBoundary: BoundaryDto): Promise<IDocument[]> {
		const documents = await this.documentModel
			.find({
				location: {
					$geoWithin: {
						$geometry: cityBoundary,
					},
				},
			})
			.lean()
			.exec();

		if (!documents.length) throw new NotFoundException('No documents found within city boundary');
		return documents;
	}

	/**
	 * Creates a new document within a city boundary.
	 * @param createDocumentDto DTO for creating a document
	 * @returns The created document
	 */
	async createDocumentInCity(createDocumentDto: CreateDocumentDto): Promise<IDocument> {
		const location = createDocumentDto.location;

		this.validateLocation(location, [LocationType.Point]);

		const isWithinBoundary = await this.isWithinBoundary(location);
		if (!isWithinBoundary) throw new BadRequestException('Document location is outside the city boundary');

		return this.documentModel.create(createDocumentDto);
	}

	/**
	 * Updates an existing document within a city boundary.
	 * @param updateDocumentDto DTO for updating the document
	 * @returns A success response
	 */
	async updateDocumentInCity(updateDocumentDto: UpdateDocumentDto): Promise<{ success: boolean }> {
		const { oldLocation, newLocation } = updateDocumentDto;

		this.validateLocation(oldLocation, [LocationType.Point]);
		this.validateLocation(newLocation, [LocationType.Point]);

		const document = await this.documentModel.findOne({ location: oldLocation }).select('location').lean().exec();
		if (!document) throw new NotFoundException(`Document with oldLocation not found`);

		const city = await this.cityModel
			.findOne({ boundary: { $geoIntersects: { $geometry: oldLocation } } })
			.lean()
			.exec();
		if (!city) throw new NotFoundException('City not found');

		const isWithinNewBoundary = await this.isWithinBoundary(newLocation, city._id);
		if (!isWithinNewBoundary) throw new BadRequestException('Updated location is outside the city boundary');

		await this.documentModel.updateOne({ _id: document._id }, { $set: { location: newLocation } });
		return { success: true };
	}

	/**
	 * Deletes a document based on its location within a city boundary.
	 * @param deleteDocumentDto DTO for deleting the document
	 * @returns A success response
	 */
	async deleteDocumentInCity(deleteDocumentDto: DeleteDocumentDto): Promise<{ success: boolean }> {
		const boundary = deleteDocumentDto.boundary;
		this.validateLocation(boundary, [LocationType.Polygon, LocationType.MultiPolygon]);

		const deleteResult = await this.documentModel.deleteOne({
			location: {
				$geoWithin: {
					$geometry: boundary,
				},
			},
		});

		if (!deleteResult.deletedCount) throw new BadRequestException('Document location is outside the city boundary');
		return { success: true };
	}

	/**
	 * Validates the location type.
	 * @param type Location type
	 * @param validTypes Array of valid location types
	 */
	private validateLocation(location: LocationDto | BoundaryDto, validTypes: LocationType[]): void {
		const { type, coordinates } = location;

		if (!validTypes.includes(type as LocationType)) {
			throw new BadRequestException(
				`Invalid location type. Valid types are: ${validTypes.join(', ')}. Received: ${type}.`,
			);
		}

		switch (type) {
			case LocationType.Point:
				if (!validatePoint(coordinates)) {
					throw new BadRequestException(
						'Invalid Point coordinates. A Point must have exactly two numerical values representing [longitude, latitude].',
					);
				}
				break;

			case LocationType.Polygon:
				if (!validatePolygon(coordinates)) {
					throw new BadRequestException(
						'Invalid Polygon coordinates. A Polygon must be an array of linear ring arrays, with the first and last points of each ring being identical to close the loop.',
					);
				}
				break;

			case LocationType.MultiPolygon:
				if (!validateMultiPolygon(coordinates)) {
					throw new BadRequestException(
						'Invalid MultiPolygon coordinates. A MultiPolygon must be an array of Polygon arrays, where each Polygon follows the linear ring structure with closed loops.',
					);
				}
				break;

			default:
				throw new BadRequestException(`Unsupported location type: ${type}.`);
		}
	}

	/**
	 * Checks if a location is within a city's boundary.
	 * @param location Location geometry
	 * @param cityId City ID for boundary validation
	 * @returns Boolean indicating whether the location is within the boundary
	 */
	private async isWithinBoundary(
		location: LocationDto,
		cityId?: Types.ObjectId,
	): Promise<{ _id: Types.ObjectId } | null> {
		const query: any = { boundary: { $geoIntersects: { $geometry: location } } };
		if (cityId) query._id = cityId;

		return this.cityModel.exists(query);
	}
}
