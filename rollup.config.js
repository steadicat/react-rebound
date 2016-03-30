import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'src/index.js',
  plugins: [
    babel({
      presets: ['es2015-rollup', 'react', 'stage-0'],
      exclude: 'node_modules/**',
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      skip: ['react', 'react-dom', 'rebound', 'stylistic'],
    }),
    commonjs({
      include: 'node_modules/**',
    }),
  ],
};
