import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
export default {
    input: {
		grpc: 'src/grpc.ts',
        queue: 'src/index.ts',
    },
    plugins: [
        json(),
        typescript(),
        babel({
            babelrc: false,
            presets: [['@babel/preset-env', { modules: false, loose: true }]],
            plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
            exclude: ['node_modules/**', "*.test.ts"],
        }),
        terser(),

    ],
    output:[
        {
            dir: 'dist',
            format: 'esm',
            entryFileNames: '[name].js', /** 保持文件名一致 */
        },
    ]
};