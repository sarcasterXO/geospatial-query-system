import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';

import { LocationDto } from './location.dto';

export class CreateDocumentDto {
	@ApiProperty({
		example: 'TEC',
		description: 'The name of the document',
	})
	@IsString()
	@IsNotEmpty({ message: 'Name is required' })
	name!: string;

	@ApiProperty({
		example: 'business',
		description: 'The type of the document',
	})
	@IsString()
	@IsNotEmpty({ message: 'Type is required' })
	type!: string;

	@ApiProperty({
		example: { type: 'Point', coordinates: [72.860_119_766_438_1, 19.173_438_75] },
		description: 'The geographical location of the document',
	})
	@IsObject()
	@IsNotEmpty({ message: 'Location is required' })
	@ValidateNested()
	@Type(() => LocationDto)
	location!: LocationDto;
}
