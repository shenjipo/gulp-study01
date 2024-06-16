import type { Plugin } from 'rollup'
import VueMacros from 'unplugin-vue-macros/rollup'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import esbuild, { minify as minifyPlugin } from 'rollup-plugin-esbuild'
import commonjs from '@rollup/plugin-commonjs'
import { rollup } from 'rollup'
import { async } from 'fast-glob'
const target = 'es2018'

const banner = '// wangxing \n'
const formatBundleFilename = (
    name: string,
    minify: boolean,
    ext: string
) => {
    return `${name}${minify ? '.min' : ''}.${ext}`
}
export const buildFullBundle = (minify: boolean) => {
    return async () => {
        const plugins: Plugin[] = [

            VueMacros({
                setupComponent: false,
                setupSFC: false,
                plugins: {
                    vue: vue({
                        isProduction: true,
                    }),
                    vueJsx: vueJsx(),
                },
            }),
            nodeResolve({
                extensions: ['.mjs', '.js', '.json', '.ts'],
            }),
            commonjs(),
            esbuild({
                exclude: [],
                sourceMap: minify,
                target,
                loaders: {
                    '.vue': 'ts',
                },
                define: {
                    'process.env.NODE_ENV': JSON.stringify('production'),
                },
                treeShaking: true,
                legalComments: 'eof',
            }),
        ]
        if (minify) {
            plugins.push(
                minifyPlugin({
                    target,
                    sourceMap: true,
                })
            )
        }

        const bundle = await rollup({
            input: path.resolve(path.resolve(__dirname, '..', 'packages1', 'element-plus'), 'index.ts'),
            plugins,
            external: (id: string) => {
                let dens: {
                    dependencies: Record<string, string>
                } = require('../package.json')
                let pkgs = Object.keys(dens['dependencies'])

                let res = pkgs.some(pkg => {
                    return id === pkg || id.startsWith(`${pkg}/`)
                })

                return res
            },
            treeshake: true,
        })

        let a = [
            {
                format: 'umd',
                file: path.resolve(
                    path.resolve(__dirname, '..', 'dist', 'element-plus'),
                    'dist',
                    formatBundleFilename('index.full', minify, 'js')
                ),
                exports: 'named',
                name: 'ElementPlus',
                globals: {
                    vue: 'Vue',
                },
                sourcemap: minify,
                banner,
              
            },
            {
                format: 'esm',
                file: path.resolve(
                    path.resolve(__dirname, '..', 'dist', 'element-plus'),
                    'dist',
                    formatBundleFilename('index.full', minify, 'mjs')
                ),
                sourcemap: minify,
                banner,
             
            },
        ].map(option => {
            bundle.write(option as any)
        })
    }



}