import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsArray } from 'class-validator';

export class LocationDto {
	@ApiProperty({
		example: 'Point',
		description: 'The type of geographical geometry',
		enum: ['Point'],
	})
	@IsEnum({ Point: 'Point' })
	@IsNotEmpty()
	type!: string;

	@ApiProperty({
		description: 'Coordinates defining the location',
		example: [72.860_119_766_438_1, 19.173_438_75],
	})
	@IsNotEmpty()
	@IsArray()
	coordinates!: number[];
}
