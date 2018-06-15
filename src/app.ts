import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
const zlib = require('zlib');
import CfgPipe from "./cfgPipe";
import DirWalkerPipe from "./dirWalkerPipe";
import FileWalkerPipe from "./fileWalkerPipe";
import LoggerPipe from "./loggerPipe";

//TODO:
//logger
//cfg - several file content processor
//cli help/error handling
//exit code
//publish on npm
//support RAR

const app = {
    /*
    readable.on('data', (data) =>
        writable.write(data)
    );*/
};

console.log("app start...\n");
var cfgPipe:CfgPipe = new CfgPipe();
var loggerPipe:LoggerPipe = new LoggerPipe(cfgPipe);

(cfgPipe)
    .pipe(new DirWalkerPipe(cfgPipe, loggerPipe))
    .pipe(new FileWalkerPipe(cfgPipe, loggerPipe))
    .pipe(loggerPipe);
//.on('end', () => { console.log("stream end.\n"); });

export default app;
