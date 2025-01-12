import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsObject, IsNotEmpty, ValidateNested } from 'class-validator';

import { LocationDto } from './location.dto';

export class UpdateDocumentDto {
	@ApiProperty({
		example: { type: 'Point', coordinates: [72.860_119_766_438_1, 19.173_438_75] },
		description: 'The geographical location of the document',
	})
	@IsObject()
	@IsNotEmpty({ message: 'Old Location is required' })
	@ValidateNested()
	@Type(() => LocationDto)
	oldLocation!: { coordinates: number[]; type: string };

	@ApiProperty({
		example: { type: 'Point', coordinates: [72.830_903_356_580_65, 19.141_336_5] },
		description: 'The geographical location of the document',
	})
	@IsObject()
	@IsNotEmpty({ message: 'New Location is required' })
	@ValidateNested()
	@Type(() => LocationDto)
	newLocation!: { coordinates: number[]; type: string };
}
