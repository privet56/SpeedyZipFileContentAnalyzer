import unzip from "unzip";

import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
var request = require('request');
var zlib = require('zlib');
var tar = require('tar');
import CfgPipe from "./cfgPipe";
import LoggerPipe from "./loggerPipe";
import { Readable, Transform, Duplex } from 'stream';

const fs = require('fs');

class FileWalkerPipe extends Transform
{
    constructor(protected cfgPipe:CfgPipe, protected loggerPipe:LoggerPipe)
    {
        super();
    }

    _write(chunk: any, encoding?: string, cb?: Function) : void
    {
        fs.createReadStream(chunk)
            .on('error', (err:any) => {
                this.loggerPipe.write("FileWalkerPipe:write("+chunk+"):ERR !fs.createReadStream:\n----------\n"+err+"\n-------------");
                cb();
            })
            .pipe(unzip.Parse())
            .on('error', (err:any) => {
                this.loggerPipe.write("FileWalkerPipe:write("+chunk+"):ERR !unzip.parse:\n----------\n"+err+"\n-------------");
                cb();
            })
            .on('entry',  (entry:unzip.Entry) =>
            {
                entry.autodrain();
                var fileName = entry.path;
                var type = entry.type; // 'Directory' or 'File'
                this.loggerPipe.write("FileWalkerPipe:write("+chunk+"):INF "+type+" found in archive:>"+fileName+"<");
                //var size = entry.size;
                //entry.pipe(fs.createWriteStream('output/path'));
            })
            .on('close', () => {
                //this.loggerPipe.write("FileWalkerPipe:write("+chunk+"):INF: close file");
                cb();
            });

        //this.loggerPipe.write("FileWalker:write: working on file '"+chunk+"'");

        /*Error: incorrect header check at Zlib.zlibOnError [as onerror] (zlib.js:153:17)
        zlib.unzip(chunk.toString(), (err:Error, data:any) =>
        {
            if (err)
            {
                //throw err;
                this.loggerPipe.write("DirWalkerPipe:write("+chunk+"):ERR:\n----------\n"+err+"\n-------------");
                cb();
                return;
            }

            //...work...
            console.log(data);
            this.loggerPipe.write("DirWalkerPipe:write("+chunk+"):INF:\n----------\n"+data+"\n-------------");
            cb();
      }); */

      /* works on tar.gz, but not on zip(Error: incorrect header check)
      var Parser = tar.Parse
      var parser = new Parser();

      fs.createReadStream(chunk)
        //.on('error', console.log)
        .on('error', (err:any) => {
            this.loggerPipe.write("DirWalkerPipe:write("+chunk+"):ERR !fs.createReadStream:\n----------\n"+err+"\n-------------");
        })
        .pipe(zlib.Unzip())
        .on('error', (err:any) => {
            this.loggerPipe.write("DirWalkerPipe:write("+chunk+"):ERR !zlib.Unzip:\n----------\n"+err+"\n-------------");
        })
        .pipe(new Parser())
        .on('entry', (entry:any) => {
            this.loggerPipe.write("DirWalkerPipe:write("+chunk+"):INF: ENTRY:\n----------\n"+entry.path+"\n-------------");
            entry.resume();
        })
        .on('end', () => {
            this.loggerPipe.write("DirWalkerPipe:write("+chunk+"):INF: END");
            cb();
        });
        */
    }
    _final()
    {
        this.push(null);
    }
}

export default FileWalkerPipe;
