export const validatePoint = (coordinates: any): boolean => {
	if (!Array.isArray(coordinates) || coordinates.length !== 2) return false;

	const [longitude, latitude] = coordinates;
	if (typeof longitude !== 'number' || typeof latitude !== 'number') return false;

	return !(longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90);
};

export const validatePolygon = (coordinates: any): boolean => {
	if (!Array.isArray(coordinates) || !coordinates.length) return false;

	for (const ring of coordinates) {
		if (!Array.isArray(ring)) return false;
		if (ring.length < 4) return false;
		if (JSON.stringify(ring[0]) !== JSON.stringify(ring[ring.length - 1])) return false;
	}
	return true;
};

export const validateMultiPolygon = (coordinates: any): boolean => {
	if (!Array.isArray(coordinates) || !coordinates.length) return false;

	for (const polygon of coordinates) if (!validatePolygon(polygon)) return false;

	return true;
};
