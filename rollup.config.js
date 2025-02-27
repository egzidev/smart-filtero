const path = require('path');
const alias = require('@rollup/plugin-alias');
const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const { terser } = require('rollup-plugin-terser');

const devMode = process.env.NODE_ENV === 'development';

module.exports = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: devMode ? 'inline' : false,
  },
  external: ['react', 'react-dom', 'lodash', 'lodash.debounce', '/\\.css$/u'],
  plugins: [
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
      ],
    }),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx', 'css'],
    }),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    postcss({
      modules: true, // Enable CSS Modules
      extract: true, // Extract to a CSS file
      minimize: !devMode, // Minify in production mode

    }),
    terser({
      ecma: 2020,
      mangle: { toplevel: true },
      compress: {
        module: true,
        toplevel: true,
        unsafe_arrows: true,
        drop_console: !devMode,
        drop_debugger: !devMode,
      },
      output: { quote_style: 1 },
    }),
  ],
};