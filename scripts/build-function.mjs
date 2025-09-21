import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildFunction() {
  try {
    await esbuild.build({
      entryPoints: [join(dirname(__dirname), 'server', 'function.ts')],
      bundle: true,
      minify: true,
      platform: 'node',
      format: 'esm',
      outdir: join(dirname(__dirname), 'netlify', 'functions'),
      external: ['aws-sdk', 'electron', 'encoding'],
      target: 'node18',
    });
    console.log('Function built successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildFunction();