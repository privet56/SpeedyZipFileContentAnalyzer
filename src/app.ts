import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
var Throttle = require('stream-throttle/index.js').Throttle;
const zlib = require('zlib');
import CfgPipe from "./cfgPipe";
import DirWalkerPipe from "./dirWalkerPipe";
import FileWalkerPipe from "./fileWalkerPipe";
import FileContentPipe from "./fileContentPipe";
import PresenterPipe from "./presenterPipe";
import LoggerPipe from "./loggerPipe";

//TODO:
//stopword handling (ignore & skip them)
//cmd params & help (see https://github.com/theclibook/theclibook/blob/master/sourcecode/client-bootstrap/bin/lounger-cli)
//throttle (to avoid maxFileHandle exceeded exception)
//output: with graph
//cfg - several file content processor
//cfg: file patterns to be analyzed
//cli help/error handling
//exit code
//publish on npm
//support RAR

const app = {

};

console.log("app start...\n");


//PARALLEL IMPLEMENTATIONS:
/*
var ParallelTransform = require('parallel-transform/index.js');
var parallelStream = ParallelTransform(10, {objectMode:true, ordered:false}, function(data:any, callback:Function)
{
    callback(null, data); // data is now a buffer
    //this._flush();
});
//.pipe(parallelStream)
*/
/*
var through2Concurrent = require('through2-concurrent');
.pipe(through2Concurrent.obj(
    {maxConcurrency: 10},
    function (chunk:any, enc?:string, callback?:Function) {
        this.push(chunk);
        callback();
    }))
*/
/*
var writableStreamParallel = new (require('writable-stream-parallel').Transform)({objectMode: true, maxWrites: 10});
writableStreamParallel._transform = function(chunk:any, output:any, cb:Function) {
    this.push(chunk);
    cb();
};
.pipe(writableStreamParallel)
*/
//.pipe(new Throttle({rate: 10, objecMode:true}))   //TODO: fork & impl objecMode

var cfgPipe:CfgPipe = new CfgPipe();
var loggerPipe:LoggerPipe = new LoggerPipe(cfgPipe);

(cfgPipe)
    .pipe(new DirWalkerPipe(cfgPipe, loggerPipe))
    .pipe(new FileWalkerPipe(cfgPipe, loggerPipe))
    .pipe(new FileContentPipe(cfgPipe, loggerPipe))
    .pipe(new PresenterPipe(cfgPipe, loggerPipe))
    .pipe(loggerPipe);
//.on('end', () => { console.log("stream end.\n"); });

export default app;
