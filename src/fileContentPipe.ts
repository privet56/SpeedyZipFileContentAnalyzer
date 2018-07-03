import unzip from "unzip";

import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
var request = require('request');
var zlib = require('zlib');
var tar = require('tar');
import { PipeTransform } from "./services/pipeTransformer";
import { ArchiveContent, ArchiveContentType } from "./model/archiveContent";
import { ArchiveCollectedData} from "./model/archiveCollectedData";
import CfgPipe from "./cfgPipe";
import LoggerPipe from "./loggerPipe";
import { Readable, Transform, Duplex } from 'stream';
//var SortedMap = require("collections/sorted-map");    //http://www.collectionsjs.com/sorted-map

const fs = require('fs');

type FromIndex<K extends string> = { [key in K]: number }

class FileContentPipe extends PipeTransform
{
    protected words : Map<string, number> = new Map<string, number>();
    protected metaContents : Map<string, number> = new Map<string, number>();

    constructor(cfgPipe:CfgPipe, loggerPipe:LoggerPipe)
    {
        super({writableObjectMode:true, readableObjectMode:true}, cfgPipe, loggerPipe);
    }

    _transform(chunk: ArchiveContent, encoding?: string, cb2BeCalledOnFinish?: Function) : void
    {
        let callbackCalled: boolean = this.onTransformStart();

        let input:string = chunk.value.toLocaleLowerCase();
        let nlastDot:number = input.lastIndexOf('.');
        let nCharsCountAfterLastDot = input.substr(nlastDot+1).length;

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

        callbackCalled = this.onTransformEnd(cb2BeCalledOnFinish, callbackCalled);
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
