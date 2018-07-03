import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
import { PipeTransform } from "./services/pipeTransformer";
import CfgPipe from "./cfgPipe";
import { Archive } from "./model/archive";
import LoggerPipe from "./loggerPipe";
import { Readable, Transform, Duplex } from 'stream';

const fs = require('fs');

class DirWalkerPipe extends PipeTransform
{
    constructor(cfgPipe:CfgPipe, loggerPipe:LoggerPipe)
    {
        super({readableObjectMode:true}, cfgPipe, loggerPipe);
    }

    _transform(chunk: any, encoding?: string, cb?: Function) : void
    {
        fs.readdir(chunk, (err:Error, files:string[]) => {

            if(!err)
            {
                files.forEach(file => {
                    let fn:string = path.join(chunk.toString(), file);
                    this.log("pushing:"+fn);
                    //this.write(new Archive(fn));
                    this.push(new Archive(fn));
                    this.log("pushed::"+fn);
                });
            }
            else
            {
                this.log("write:ERR:"+err);
                this.loggerPipe.write(err);
            }

            this.push(null);
            cb();
            this.end();
        });
    }
    _final(cb?:Function)
    {
        cb();
    }
}

export default DirWalkerPipe;
