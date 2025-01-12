import { ApiProperty } from '@nestjs/swagger';
import { type InferSchemaType, Schema, SchemaTypes } from 'mongoose';

import { validatePoint } from 'src/util/GeoJSONValidator';

export const DocumentSchemaName = 'document';

const isValidGeoJSON = (value: any) => {
	if (!value || typeof value !== 'object') return false;

	const { type, coordinates } = value;

	if (type !== 'Point') return false;
	return validatePoint(coordinates);
};

export const DocumentSchema = new Schema(
	{
		name: {
			type: SchemaTypes.String,
			required: true,
		},
		type: {
			type: SchemaTypes.String,
			required: true,
		},
		location: {
			type: SchemaTypes.Mixed,
			required: true,
			validate: {
				validator: isValidGeoJSON,
				message: 'Invalid GeoJSON location or coordinate format in location field',
			},
		},
	},
	{
		timestamps: true,
	},
);

DocumentSchema.index({ location: '2dsphere' });

export type IDocument = InferSchemaType<typeof DocumentSchema>;

export class DocumentResponse implements IDocument {
	@ApiProperty({ example: '507f1f77bcf86cd799439011' })
	_id!: string;

	@ApiProperty({
		example: 'Oberoi',
		description: 'Name of the document',
	})
	name!: string;

	@ApiProperty({
		example: 'business',
		description: 'Type of the document',
	})
	type!: string;

	@ApiProperty({
		example: {
			type: 'Point',
			coordinates: [72.860_119_766_438_1, 19.173_438_75],
		},
		description: 'Geographical location of the document as a GeoJSON Point',
	})
	location!: {
		coordinates: number[];
		type: 'Point';
	};

	@ApiProperty({ example: '2024-01-10T12:00:00.000Z' })
	createdAt!: Date;

	@ApiProperty({ example: '2024-01-10T12:00:00.000Z' })
	updatedAt!: Date;
}
