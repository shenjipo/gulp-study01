import { parallel, series } from 'gulp'
import { spawn } from 'child_process'
export * from './src/index.js'

import { buildModules } from './src/bundle.ts'
import { buildFullBundle } from './src/fullBundle.ts'
import { copyThemeChalkSource } from './src/buildThemeChalk.ts'
import { buildThemeChalk } from './src/buildThemeChalk.ts'
import { copyThemeChalkBundle } from './src/buildThemeChalk.ts'

const run = async (command) => {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command.split(' ')
        spawn(cmd, args, {
            stdio: 'inherit',
            shell: process.platform === 'win32',
        })
        resolve()
    })
}
const myRun = (command) => {
    return async () => {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ')
            spawn(cmd, args, {
                stdio: 'inherit',
                shell: process.platform === 'win32',
            })
            resolve()
        })
    }
}
const syaYes = async () => {
    console.log('yes')
}
export default series(
    syaYes,
    buildModules
    // buildFullBundle(false),
    // buildFullBundle(true),
    // parallel(copyThemeChalkSource, series(buildThemeChalk, copyThemeChalkBundle))
)


