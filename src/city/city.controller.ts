import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

import { CityService } from './city.service';
import { BoundaryDto } from './dto/boundary.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DeleteDocumentDto } from './dto/delete-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CityResponse, type ICity } from './schemas/city.schema';
import { DocumentResponse, type IDocument } from './schemas/document.schema';

@ApiTags('City')
@Controller('city')
export class CityController {
	constructor(private readonly cityService: CityService) {}

	@Get(':cityName')
	@ApiOperation({ summary: 'Find city by name' })
	@ApiParam({ name: 'cityName', description: 'Name of the city' })
	@ApiResponse({
		status: 200,
		description: 'City found successfully',
		type: CityResponse,
	})
	async findCityByName(@Param('cityName') cityName: string): Promise<ICity> {
		return this.cityService.findCityByName(cityName);
	}

	@Post('documents/find')
	@ApiOperation({ summary: 'Find documents within city boundary' })
	@ApiBody({ type: BoundaryDto })
	@ApiResponse({
		status: 201,
		description: 'Documents found successfully',
		type: [DocumentResponse],
	})
	@ApiResponse({ status: 404, description: 'No documents found' })
	async findDocumentsByCityBoundary(@Body() fetchDocumentDto: BoundaryDto): Promise<IDocument[]> {
		return this.cityService.findDocumentsByCityBoundary(fetchDocumentDto);
	}

	@Post('documents/create')
	@ApiOperation({ summary: 'Create document in city within a city boundary' })
	@ApiBody({ type: CreateDocumentDto })
	@ApiResponse({
		status: 201,
		description: 'Document created successfully',
		type: DocumentResponse,
	})
	@ApiResponse({ status: 400, description: 'Invalid document data or location' })
	async createDocumentInCity(@Body() createDocumentDto: CreateDocumentDto): Promise<IDocument> {
		return this.cityService.createDocumentInCity(createDocumentDto);
	}

	@Put('documents/update')
	@ApiOperation({ summary: 'Update document within city boundary' })
	@ApiBody({ type: UpdateDocumentDto })
	@ApiResponse({
		status: 200,
		description: 'Document updated successfully',
		example: { success: true },
	})
	@ApiResponse({ status: 400, description: 'Location outside city boundary' })
	@ApiResponse({ status: 404, description: 'Document not found' })
	async updateDocumentInCity(@Body() updateDocumentDto: UpdateDocumentDto) {
		return this.cityService.updateDocumentInCity(updateDocumentDto);
	}

	@Delete('documents/delete')
	@ApiOperation({ summary: 'Delete document within city boundary' })
	@ApiBody({ type: DeleteDocumentDto })
	@ApiResponse({
		status: 200,
		example: { success: true },
	})
	@ApiResponse({ status: 400, description: 'Location outside city boundary' })
	async deleteDocumentInCity(@Body() deleteDocumentDto: DeleteDocumentDto): Promise<{ success: boolean }> {
		return this.cityService.deleteDocumentInCity(deleteDocumentDto);
	}
}
