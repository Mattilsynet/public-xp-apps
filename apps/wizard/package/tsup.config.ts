import { defineConfig } from 'tsup'

export default defineConfig({
  bundle: true, // Bundle dependencies
  dts: true, // Generate .d.ts files
  minify: false, // Minify output
  sourcemap: true, // Generate sourcemaps
  treeshake: true, // Remove unused code
  splitting: false, // Split output into chunks
  clean: true, // Clean output directory before building
  entry: ['./index.ts'], // Entry point(s)
  outDir: 'dist', // Output directory
  format: ['esm'], // Output format(s)
})
