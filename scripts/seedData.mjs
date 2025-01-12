/* eslint-disable no-console */
import process from 'node:process';

import { union, featureCollection, geometryCollection } from '@turf/turf';
import mongoose from 'mongoose';
import { request } from 'undici';

import { cityModel } from '../src/city/schemas/city.model';
// import { documentModel } from '../src/city/schemas/document.model';

const citiesData = [
	{ name: 'Mumbai', osmIds: ['R7964375', 'R7964376'] },
	{ name: 'Pune', osmIds: ['R1986140'] },
	{ name: 'Bengaluru', osmIds: ['R2020589', 'R2020588'] },
	{ name: 'Hyderabad', osmIds: ['R15027443'] },
	{ name: 'Delhi', osmIds: ['R1942586'] },
];

console.time('seedData');

await mongoose.connect(process.env.MONGO_URI);
console.log('Connected to Database!');

console.log(`Starting to add ${citiesData.length} cities in the database...`);

const successArray = [];
for (const city of citiesData) {
	console.log(`\nFinding boundary for ${city.name} city`);
	const { body } = await request(
		`https://nominatim.openstreetmap.org/lookup?osm_ids=${encodeURIComponent(city.osmIds.join(','))}&format=geojson&polygon_geojson=1`,
	);
	const res = await body.json();
	const features = res.features;
	if (!features?.length) console.error(`Could not find data for ${city.name} city`);

	let boundary = features
		.map((feature) => feature.geometry)
		.filter((geometry) => ['Polygon', 'MultiPolygon'].includes(geometry.type));

	if (features.length > 1) {
		console.log('Found more than one GeoJSON data, starting to merge...');

		const mergedData = union(featureCollection(res.features));
		console.log('Merged the data successfully');

		boundary = mergedData.geometry;
	} else boundary = boundary[0];

	if (!boundary) {
		console.eror(`Could not find boundary for ${city.name} city`);
		continue;
	}

	await cityModel.create({
		name: city.name,
		boundary,
	});
	console.log(`Added ${city.name} city in the database.`);

	successArray.push(city.name);
}

console.log(
	`Successfully added ${successArray.length}/${citiesData.length} cities in the database: \n${successArray.join(' | ')}`,
);

console.log('\n-------------------------------------------------------------------------\n');

// const locationData = [
// 	{ name: 'Oberoi Mall', type: 'business', osmIds: ['W102537787'] },
// 	{ name: 'Malabar Hill', type: 'landmark', osmIds: ['N469318604'] },
// 	{ name: 'Cubbon Park', type: 'landmark', osmIds: ['W22895320'] },
// 	{ name: 'Kempegowda International Airport', type: 'business', osmIds: ['W252746837'] },
// ];

// console.log(`Starting to add ${locationData.length} locations in the database...`);

// successArray = [];
// for (const location of locationData) {
// 	console.log(`\nFinding boundary for ${location.name} location`);
// 	const { body } = await request(
// 		`https://nominatim.openstreetmap.org/lookup?osm_ids=${encodeURIComponent(location.osmIds.join(','))}&format=geojson`,
// 	);
// 	const res = await body.json();
// 	const features = res.features;
// 	if (!features?.length) console.error(`Could not find data for ${location.name} location`);

// 	const geometry = features.map((feature) => feature.geometry).find((geometry) => geometry.type === 'Point');
// 	if (!geometry) {
// 		console.error(`Could not find geometry for ${location.name} location`);
// 		continue;
// 	}

// 	await documentModel.create({
// 		name: location.name,
// 		type: location.type,
// 		location: geometry,
// 	});
// 	console.log(`Added ${location.name} in the database.`);

// 	successArray.push(location.name);
// }

// console.log(
// 	`Successfully added ${successArray.length}/${locationData.length} locations in the database: \n${successArray.join(' | ')}`,
// );

console.timeEnd('seedData');

process.exit(0);
