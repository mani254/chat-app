import typescript from '@rollup/plugin-typescript';

const makeConfig = (input, output) => ({
  input,
  output: {
    file: output,
    format: 'esm',
    sourcemap: true
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json',
      declaration: true,
      declarationDir: `./dist/${output.split('/').slice(1, -1).join('/')}`,
      sourceMap: true
    })
  ],
  external: ['mongoose']
});

export default [
  // Main package entry point
  makeConfig('src/index.ts', 'dist/index.js'),
  // Schemas entry point
  makeConfig('src/schemas/index.ts', 'dist/schemas/index.js'),
  // Consts entry point
  makeConfig('src/consts/index.ts', 'dist/consts/index.js')
];