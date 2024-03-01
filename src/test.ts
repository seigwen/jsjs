

import * as interpreter from './main'

const sourceCode = `function f6(){console.log(f.c)}; var f={c:1}; f6();`
// const sourceCode = `var f={c:1};`

// 解释器执行
interpreter.run(sourceCode)

// // 自举解释器代码
// declare const require, __dirname
// const fs = require('fs')
// const interpreter_code = fs.readFileSync('./lib/interpreter.js', 'utf-8')
// const bootstrap = interpreter.run(interpreter_code)

// // 自举的解释器实行 hello world
// bootstrap.run(`console.log('hello world!')`)