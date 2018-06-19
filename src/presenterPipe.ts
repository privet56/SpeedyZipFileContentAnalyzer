import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
import CfgPipe from "./cfgPipe";
import LoggerPipe from "./loggerPipe";
import { ArchiveCollectedData } from './model/archiveCollectedData';
import { Readable, Transform, Duplex } from 'stream';
import { Time } from "./services/time";

const fs = require('fs');

class PresenterPipe extends Transform
{
    protected timer:Time = new Time();

    constructor(protected cfgPipe:CfgPipe, protected loggerPipe:LoggerPipe)
    {
        super({writableObjectMode:true});
    }

    _write(chunk: ArchiveCollectedData, encoding?: string, cb?: Function) : void
    {
        let n:number = 0;
        let maxEntries:number = 33;//TODO: from cfg
        let sortedMap:Map<string, number> = chunk.getWords(true);

        sortedMap.forEach((value:number, key:string) =>
        {
            n++;
            if(n < maxEntries)
            {
                this.loggerPipe.write("PresenterPipe:write:("+n+") '"+key+"' = "+value);
            }
        });
        this.loggerPipe.write("PresenterPipe:write: done ("+this.timer.to()+") #words:"+sortedMap.size);
    }
    _final()
    {

    }
}

export default PresenterPipe;
