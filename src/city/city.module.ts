import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CityController } from './city.controller';
import { CityService } from './city.service';
import { CitySchema, CitySchemaName } from './schemas/city.schema';
import { DocumentSchema, DocumentSchemaName } from './schemas/document.schema';

@Module({
	imports: [
		MongooseModule.forFeature(
			[
				{ name: CitySchemaName, schema: CitySchema },
				{ name: DocumentSchemaName, schema: DocumentSchema },
			],
			'tec',
		),
	],
	controllers: [CityController],
	providers: [CityService],
})
export class CityModule {}
