import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
import CfgPipe from "./cfgPipe";
import LoggerPipe from "./loggerPipe";
import { Readable, Transform, Duplex } from 'stream';

const fs = require('fs');

class DirWalkerPipe extends Transform
{
    constructor(protected cfgPipe:CfgPipe, protected loggerPipe:LoggerPipe)
    {
        super();
    }

    _write(chunk: any, encoding?: string, cb?: Function) : void
    {
        fs.readdir(chunk, (err:Error, files:string[]) => {

            if(!err)
            {
                files.forEach(file => {
                    this.push(path.join(chunk.toString(), file));
                });
            }
            else
            {
                this.loggerPipe.write("DirWalkerPipe:write:ERR:"+err);
                this.loggerPipe.write(err);
            }

            this.push(null);
            cb();
        });
    }
    _final()
    {

    }
}

export default DirWalkerPipe;