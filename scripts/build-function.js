const { build } = require('esbuild');
const path = require('path');

async function buildFunction() {
  try {
    await build({
      entryPoints: ['server/function.ts'],
      bundle: true,
      minify: true,
      platform: 'node',
      format: 'esm',
      outdir: path.join(process.cwd(), 'netlify', 'functions'),
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