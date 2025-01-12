import { model } from 'mongoose';

import { DocumentSchema, DocumentSchemaName } from './document.schema';

export const documentModel = model(DocumentSchemaName, DocumentSchema);
