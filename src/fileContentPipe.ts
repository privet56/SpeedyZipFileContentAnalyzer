import unzip from "unzip";

import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
var request = require('request');
var zlib = require('zlib');
var tar = require('tar');
import { ArchiveContent, ArchiveContentType } from "./model/archiveContent";
import { ArchiveCollectedData} from "./model/archiveCollectedData";
import CfgPipe from "./cfgPipe";
import LoggerPipe from "./loggerPipe";
import { Readable, Transform, Duplex } from 'stream';
//var SortedMap = require("collections/sorted-map");    //http://www.collectionsjs.com/sorted-map

const fs = require('fs');

type FromIndex<K extends string> = { [key in K]: number }

class FileContentPipe extends Transform
{
    protected words : Map<string, number> = new Map<string, number>();
    protected metaContents : Map<string, number> = new Map<string, number>();
    protected inReadCurrently:number = 0;

    constructor(protected cfgPipe:CfgPipe, protected loggerPipe:LoggerPipe)
    {
        super({writableObjectMode:true, readableObjectMode:true});
    }

    _write(chunk: ArchiveContent, encoding?: string, cb2BeCalledOnFinish?: Function) : void
    {
        this.inReadCurrently++;
        if(this.inReadCurrently != 1 ) this.loggerPipe.write("FileContentPipe:write("+chunk.value+") this.inReadCurrently:"+this.inReadCurrently);
        let input:string = chunk.value.toLocaleLowerCase();
        let nlastDot:number = input.lastIndexOf('.');
        let nCharsCountAfterLastDot = input.substr(nlastDot+1).length;

        //console.log("input:'"+input+"' nlastDot:"+nlastDot+" nCharsCountAfterLastDot:"+nCharsCountAfterLastDot+" inputWithExtensionStripped:'"+input.substr(0, nlastDot)+"'");

        if (nCharsCountAfterLastDot < 5)
        {
            input = input.substr(0, nlastDot);
        }
        let a:string[] = input.split(/[^a-z]/g);//TODO: handle locals!

        let alreadySavedTerms:Map<string, number> = chunk.type == ArchiveContentType.name ? this.words : this.metaContents;

        a.map((word:string) =>
        {
            if(!word)return null;
            if(word.length < 3)return null;
            let n:number = alreadySavedTerms.has(word) ? alreadySavedTerms.get(word) : 0;
            alreadySavedTerms.set(word, n+1);
        });

        cb2BeCalledOnFinish();
        this.inReadCurrently--;
    }
    _final(cb2BeCalledOnFinish?: Function)
    {
        {
            var arvhiveCollectedData:ArchiveCollectedData = new ArchiveCollectedData(this.words, ArchiveContentType.name);
            this.push(arvhiveCollectedData);
        }
        {
            var arvhiveCollectedData:ArchiveCollectedData = new ArchiveCollectedData(this.metaContents, ArchiveContentType.metadata);
            this.push(arvhiveCollectedData);
        }
        cb2BeCalledOnFinish();
    }
}

export default FileContentPipe;
