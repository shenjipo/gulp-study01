import glob from 'fast-glob'



export const TestGlob = async () => {
    console.log(__dirname)
    const fileList = await glob('**/*.{js,ts,vue}', {
        cwd: __dirname,
        absolute: true,
        onlyFiles: true,
    })
    console.log(fileList)
}