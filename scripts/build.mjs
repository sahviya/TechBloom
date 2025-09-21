import * as esbuild from 'esbuild';

try {
  await esbuild.build({
    entryPoints: ['server/function.ts'],
    bundle: true,
    minify: true,
    platform: 'node',
    format: 'esm',
    outfile: 'netlify/functions/server.js',
    external: [
      // Core Node.js modules
      'fs', 'path', 'crypto', 'http', 'https', 'stream', 'util', 'url',
      // Dependencies that should be external
      'aws-sdk', 'mock-aws-s3', 'nock', '@mapbox/node-pre-gyp',
      'electron', 'encoding', 'bcrypt', '@prisma/client', 'serverless-http',
      '@google/genai'
    ],
    target: 'node18',
    sourcemap: true,
  });
  console.log('Server function built successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}