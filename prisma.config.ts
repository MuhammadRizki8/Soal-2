import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const cfg: any = {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
  // Move seed command here to avoid deprecated package.json#prisma usage
  // This runs the existing TypeScript seed file via ts-node during development
  seed: {
    run: 'ts-node --compiler-options "{"module":"CommonJS"}" prisma/seed.ts',
  },
};

export default defineConfig(cfg);
