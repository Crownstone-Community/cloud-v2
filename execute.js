#! /usr/bin/env node
Error.stackTraceLimit = 1000

let main = require("./dist/index")
main.main()

