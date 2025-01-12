# Geospatial Query System

A Geospatial Query System built with NestJS and MongoDB

## Prerequisites

- **Node.js** (>= 18.x)
- **Bun** (>= 1.x) - Recommended package manager
- Alternatively, you can use:
  - **npm** (>= 10.x)
  - **yarn** (>= 4.x)
  - **pnpm** (>= 9.x)

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/sarcasterXO/geospatial-query-system.git
   cd geospatial-query-system
   ```

2. Install dependencies:

   ```sh
   npm install
   # or
   bun install
   # or
   yarn install
    # or
   pnpm install
   ```

3. Copy the example environment file and configure it as needed:

   ```sh
   cp .env.example .env
   ```

## Seeding the Database

To seed the database with initial data, run the following command:

```sh
   node ./scripts/seedData.mjs
    # or
   bun run ./scripts/seedData.mjs
```

## Running the Application

### Development

To start the application in development mode with hot-reloading:

```sh
npm run dev
# or
bun dev
# or
yarn dev
# or
pnpm run dev
```

### Production

To build and start the application in production mode:

```sh
npm run build
npm run start
# or
bun run build
bun start
# or
yarn build
yarn start
# or
pnpm run build
pnpm run start
```

## Testing

### Unit Test

To run the unit tests:

```sh
npm run test
# or
bun run test
# or
yarn test
# or
pnpm run test

```

### End to End Test

To run the end-to-end tests:

```sh
npm run test:e2e
# or
bun run test:e2e
# or
yarn test:e2e
# or
pnpm run test:e2e
```

## API Documentation

The API documentation is available at:
http://localhost:3071/docs

> **Note:** If you modify the `PORT` value in the `.env` file, make sure to update the URL accordingly to reflect the new port.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
