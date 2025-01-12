import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';

import { BoundaryDto } from './boundary.dto';

export class DeleteDocumentDto {
	@ApiProperty({
		example: {
			type: 'Polygon',
			coordinates: [
				[
					[72.776_333, 19.224_945_1],
					[72.776_365_4, 19.224_043_4],
					[72.776_390_2, 19.223_560_8],
				],
			],
		},
		description: 'The geographical location of the document',
	})
	@IsObject()
	@IsNotEmpty({ message: 'Boundary is required' })
	@ValidateNested()
	@Type(() => BoundaryDto)
	boundary!: { coordinates: number[][] | number[][][] | number[][][][]; type: string };
}
