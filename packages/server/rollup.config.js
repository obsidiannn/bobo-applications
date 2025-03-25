import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
const getInputs = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const srcPath = path.join(__dirname, 'src');
    const files = fs.readdirSync(srcPath);
    const keys = {};
    for (const i in files) {
        const file = files[i];
        const filePath = path.join(srcPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() || !file.endsWith('.ts')) {
            continue;
        }
        const key = file.split('.')[0];
        keys[key] = filePath;
    }
    return keys;
};
export default {
    input: getInputs(),
    plugins: [
        json(),
        commonjs(),
        babel({
            babelrc: false,
            presets: [['@babel/preset-env', { modules: false, loose: true }]],
            plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
            exclude: 'node_modules/**',
        }),
        typescript({
            tsconfig: './tsconfig.json'
        }),
        terser(),
    ],
    output: {
        dir: 'dist',
        format: 'esm',
        entryFileNames: '[name].js', /** 保持文件名一致 */
    },
};