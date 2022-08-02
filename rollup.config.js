import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'builtin-modules';

export default {
  input: 'src/autotask.js',
  output: {
    file: 'dist/autotask/index.js',
    format: 'cjs',
    exports: 'auto'
  },
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    json({ compact: true })
  ],
  external: [
    ...builtins,
    'ethers',
    'web3',
    'axios',
    /^defender-relay-client(\/.*)?$/,
  ],
};