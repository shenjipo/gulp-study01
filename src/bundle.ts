import glob from 'fast-glob'
import { rollup } from 'rollup'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/rollup'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'

import type { ModuleFormat } from 'rollup'
import path from 'path'

const projRoot = resolve(__dirname, '..')
const buildOutput = resolve(projRoot, 'dist')
const epOutput = resolve(buildOutput, 'element-plus')
const pkgRoot = resolve(projRoot, 'packages1')
const epRoot = resolve(pkgRoot, 'element-plus')


const PKG_NAME = 'element-plus'
const modules = ['esm', 'cjs'] as const
type Module = typeof modules[number]
interface BuildInfo {
    module: 'ESNext' | 'CommonJS'
    format: ModuleFormat
    ext: 'mjs' | 'cjs' | 'js'
    output: {
        /** e.g: `es` */
        name: string
        /** e.g: `dist/element-plus/es` */
        path: string
    }

    bundle: {
        /** e.g: `element-plus/es` */
        path: string
    }
}

const buildConfig: Record<Module, BuildInfo> = {
    esm: {
        module: 'ESNext',
        format: 'esm',
        ext: 'mjs',
        output: {
            name: 'es',
            path: path.resolve(epOutput, 'es'),
        },
        bundle: {
            path: `${PKG_NAME}/es`,
        },
    },
    cjs: {
        module: 'CommonJS',
        format: 'cjs',
        ext: 'js',
        output: {
            name: 'lib',
            path: path.resolve(epOutput, 'lib'),
        },
        bundle: {
            path: `${PKG_NAME}/lib`,
        },
    },
}
const excludeFiles = (files: string[]) => {
    const excludes = ['node_modules', 'test', 'mock', 'gulpfile', 'dist']
    return files.filter(
        (path) => !excludes.some((exclude) => path.includes(exclude))
    )
}
export const buildModules = async () => {
    const input = excludeFiles(await glob('**/*.{js,ts,vue}', {
        cwd: resolve(__dirname, '../packages1'),
        absolute: true,
        onlyFiles: true,
    }))

    const bundle = await rollup({
        input,
        plugins: [
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
                sourceMap: true,
                target: 'es2018',
                loaders: {
                    '.vue': 'ts',
                },
            }),
        ],
        // external: (id: string) => {
        //     const dens: {
        //         dependencies: Record<string, string>
        //     } = require('../package.json')
        //     let res = Object.keys(dens['dependencies']).some(pkg => {
        //         return id === pkg || id.startsWith(`${pkg}/`)
        //     })
          
        //     return res
        // },
        treeshake: false,
    })

    Object.entries(buildConfig).map(([module, config]) => {
        return {
            format: config.format,
            dir: config.output.path,
            exports: module === 'cjs' ? 'named' : undefined,
            preserveModules: true,
            preserveModulesRoot: epRoot,
            sourcemap: true,
            entryFileNames: `[name].${config.ext}`,
        }
    }).map(option => {
        bundle.write(option as any)
    })

}