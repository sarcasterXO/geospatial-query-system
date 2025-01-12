/* eslint-disable no-console */
import process from 'node:process';
import { URL } from 'node:url';

import { request } from 'undici';

/**
 * @typedef {Object} GeoJSONResponse
 * @property { { geometry: { type: string, coordinates: number[][][] } }[] } features
 */

/**
 * Generate boundaries for a location
 * @param {string} location
 * @param {boolean} [polygon=true]
 * @param {boolean} [osm = false]
 * @returns { Promise<void | { type: string, coordinates: number[][][] }> }
 */

export const generateBoundaries = async (location, polygon = true, osm = false) => {
	if (!location) return console.error('Please provide a location');
	if (typeof location !== 'string') return console.error('Location must be a string');

	try {
		console.log(`Finding boundary for ${location}`);

		const url = osm
			? `https://nominatim.openstreetmap.org/lookup?osm_ids=${encodeURIComponent(location)}&format=geojson${polygon ? '&polygon_geojson=1' : ''}`
			: `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=geojson${polygon ? '&polygon_geojson=1' : ''}`;

		const { body } = await request(url);

		const responseData = /** @type {GeoJSONResponse} */ (await body.json());
		console.log(responseData.features);
		const boundary = responseData.features[0].geometry;

		console.log(`Generated boundary for ${location}`);
		console.log('\nBoundary:', boundary);

		return boundary;
	} catch (error) {
		console.error(`Error generating boundary for ${location}:`, error);
	}
};

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
	const args = process.argv.slice(2);
	const polygonIndex = args.indexOf('--polygon');
	const osmIndex = args.indexOf('--osm');

	let location = args.join(' ');
	if (polygonIndex !== -1) location = args.slice(polygonIndex + 1, osmIndex === -1 ? undefined : osmIndex).join(' ');

	if (osmIndex !== -1) location += (location ? ' ' : '') + args.slice(osmIndex + 1).join(' ');

	if (!location) {
		console.error('Please provide a location');
		process.exit(1);
	}

	await generateBoundaries(location, polygonIndex !== -1, osmIndex !== -1);
}
