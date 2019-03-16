import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';

export default [
  {
    input: './src/index.ts',
    output: [{file: './dist/index.js', format: 'cjs'}, {file: './dist/index.es.js', format: 'es'}],
    external: ['rebound', 'react', 'react-dom'],
    plugins: [
      resolve({}),
      commonjs({
        namedExports: {
          './node_modules/react/index.js': ['useState'],
          './node_modules/rebound/dist/rebound.js': ['SpringConfig'],
        },
      }),
      typescript({
        typescript: require('typescript'),
        check: false,
      }),
    ],
  },
  {
    input: './demo.tsx',
    output: [{file: './demo.js', format: 'iife'}],
    plugins: [
      resolve({browser: true}),
      commonjs({
        namedExports: {
          './node_modules/react/index.js': ['useState'],
          './node_modules/rebound/dist/rebound.js': ['SpringConfig'],
        },
      }),
      typescript({
        typescript: require('typescript'),
        check: false,
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
    ],
  },
];
