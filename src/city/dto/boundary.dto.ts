import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsArray } from 'class-validator';

export class BoundaryDto {
	@ApiProperty({
		example: 'Polygon',
		description: 'The type of geographical geometry',
		enum: ['Polygon', 'MultiPolygon'],
	})
	@IsEnum({ Polygon: 'Polygon', MultiPolygon: 'MultiPolygon' })
	@IsNotEmpty()
	type!: string;

	@ApiProperty({
		description: 'Coordinates defining the location',
		example: [
			[
				[72.776_333, 19.224_945_1],
				[72.776_365_4, 19.224_043_4],
				[72.776_390_2, 19.223_560_8],
				[72.776_771_8, 19.222_99],
				[72.776_775_9, 19.222_150_4],
				[72.777_692_6, 19.221_682],
			],
		],
	})
	@IsNotEmpty()
	@IsArray()
	coordinates!: number[][] | number[][][] | number[][][][];
}
