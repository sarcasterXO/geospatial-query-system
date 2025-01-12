import { ApiProperty } from '@nestjs/swagger';
import { type InferSchemaType, Schema, SchemaTypes } from 'mongoose';

import { validateMultiPolygon, validatePolygon } from 'src/util/GeoJSONValidator';

const isValidGeoJSON = (value: any) => {
	if (!value || typeof value !== 'object') return false;

	const { type, coordinates } = value;
	if (!['Polygon', 'MultiPolygon'].includes(type)) return false;

	if (type === 'Polygon') return validatePolygon(coordinates);
	if (type === 'MultiPolygon') return validateMultiPolygon(coordinates);

	return false;
};

export const CitySchemaName = 'city';

export const CitySchema = new Schema(
	{
		name: {
			type: SchemaTypes.String,
			required: true,
		},
		boundary: {
			type: SchemaTypes.Mixed,
			required: true,
			validate: {
				validator: isValidGeoJSON,
				message: 'Invalid GeoJSON data or coordinate format in boundary field',
			},
		},
	},
	{
		timestamps: true,
	},
);

CitySchema.index({ boundary: '2dsphere' });

export type ICity = InferSchemaType<typeof CitySchema>;

export class CityResponse implements ICity {
	@ApiProperty({ example: '507f1f77bcf86cd799439011' })
	_id!: string;

	@ApiProperty({ example: 'Mumbai', description: 'Name of the city' })
	name!: string;

	@ApiProperty({
		example: {
			type: 'Polygon',
			coordinates: [
				[
					[72.776_333, 19.224_945_1],
					[72.776_365_4, 19.224_043_4],
					[72.776_390_2, 19.223_560_8],
					[72.776_771_8, 19.222_99],
					[72.776_775_9, 19.222_150_4],
					[72.777_692_6, 19.221_682],
				],
			],
		},
		description: 'Geographical boundary of the city',
	})
	boundary!: {
		coordinates: number[] | number[][] | number[][][] | number[][][][];
		type: 'Polygon' | 'MultiPolygon';
	};

	@ApiProperty({ example: '2024-01-10T12:00:00.000Z' })
	createdAt!: Date;

	@ApiProperty({ example: '2024-01-10T12:00:00.000Z' })
	updatedAt!: Date;
}
