declare namespace NodeJS {
	interface ProcessEnv {
		readonly MONGO_URI: string;
		readonly NODE_ENV: 'development' | 'production';
		readonly PORT: number;
	}
}
