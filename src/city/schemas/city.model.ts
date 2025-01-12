import { model } from 'mongoose';

import { CitySchema, CitySchemaName } from './city.schema';

export const cityModel = model(CitySchemaName, CitySchema);
