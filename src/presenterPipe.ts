import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
import CfgPipe from "./cfgPipe";
import LoggerPipe from "./loggerPipe";
import { ArchiveCollectedData } from './model/archiveCollectedData';
import { ArchiveContentType } from './model/archiveContent';
import { Readable, Transform, Duplex } from 'stream';
import { Time } from "./services/time";
import Table from 'cli-table';

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
        let nEntry:number = 0;
        let maxEntries:number = Number.parseInt(this.cfgPipe.getString("wordMaxCount2Output", "33"));

        let sortedMap:Map<string, number> = chunk.getWords(true);

        const table = new Table({
            head: ['#', 'word ('+chunk.archiveContentType+')', 'occurences'],
            colWidths: [5, 33, 13],
            style: {head: ['green'], border: ['yellow']}
        });

        sortedMap.forEach((value:number, key:string) =>
        {
            nEntry++;
            if(nEntry < maxEntries)
            {
                table.push([nEntry, key, value]);
            }
        });
        console.log(table.toString());
        this.loggerPipe.write("PresenterPipe:write: done ("+this.timer.to()+") #words:"+sortedMap.size+' ('+chunk.archiveContentType+')');
        cb();
    }
    _final(cb?: Function)
    {
        cb();
    }
}

export default PresenterPipe;
