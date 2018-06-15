import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
import CfgPipe from "./cfgPipe";

import { Readable, Transform, Duplex, Writable } from 'stream';

class LoggerPipe extends Writable
{
    constructor(protected cfgPipe:CfgPipe)
    {
        super();
    }
    /*push(chunk: any, encoding?: string):boolean
    {
        console.log("logger:push:"+chunk.toString());
        super.push(chunk, encoding);
        return true;
    }*/
    _write(chunk: any, encoding?: string, cb?: Function) : void
    {
        console.log(chunk.toString());
        cb();
    }
    _read(size:number) : void
    {
        //console.log("logger:read("+size+")");
    }
    _final()
    {
        console.log("END");
    }
}

export default LoggerPipe;
