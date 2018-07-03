import unzip from "unzip";
const os = require('os');
import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
var request = require('request');
var zlib = require('zlib');
var tar = require('tar');

var mi = require('mediainfo-wrapper');
import { PipeTransform } from "./services/pipeTransformer";
import { Archive } from "./model/archive";
import { ArchiveContent, ArchiveContentType } from "./model/archiveContent";
import CfgPipe from "./cfgPipe";
import LoggerPipe from "./loggerPipe";
import { Readable, Transform, Duplex, TransformOptions } from 'stream';
import { ArchiveCollectedData } from "./model/archiveCollectedData";

const fs = require('fs');

class FileWalkerPipe extends PipeTransform
{
    protected nrOfArchivesRead:number = 0;

    constructor(cfgPipe:CfgPipe, loggerPipe:LoggerPipe)
    {
        super({writableObjectMode:true, readableObjectMode:true}, cfgPipe, loggerPipe);
    }

    _transform(chunk: Archive, encoding?: string, cb2BeCalledOnFinish?: Function) : void
    {
        let fn:string = chunk.fn;
        let sLogPostFix:string = "write: START listing("+(this.nrOfArchivesRead+1)+") file '"+fn;
        let callbackCalled: boolean = this.onTransformStart(sLogPostFix, true);

        let nrOfFilesInArchive:number = 0;
        let start:Date = new Date();
        let self = this;

        //TODO: skip 0 byte ZIP files!

        fs.createReadStream(fn)
            .on('error', (err:any) => {
                this.log("write("+chunk.fn+"):ERR !fs.createReadStream:\n----------\n"+err+"\n-------------");
                callbackCalled = this.onTransformEnd(cb2BeCalledOnFinish, callbackCalled);
            })
            .pipe(unzip.Parse())
            .on('error', (err:any) => {
                this.log("write("+chunk.fn+"):ERR !unzip.parse:\n----------\n"+err+"\n-------------");
                callbackCalled = this.onTransformEnd(cb2BeCalledOnFinish, callbackCalled);
            })
            .on('entry',  (entry:unzip.Entry) =>
            {
                var fileName = entry.path;
                var type = entry.type; // 'Directory' or 'File'
                //this.log("write("+chunk+"):INF "+type+" found in archive:>"+fileName+"<");
                var arvhiveFileContent:ArchiveContent = new ArchiveContent(ArchiveContent.name, fileName, ArchiveContentType.name, chunk.fn);
                this.push(arvhiveFileContent);
                nrOfFilesInArchive++;
                /*if((nrOfFilesInArchive % 1000) === 0)
                {
                    let end:Date = new Date();
                    let duration:number = ((end.valueOf() - start.valueOf()) / 1000);
                    let sDuration = (duration < 11) ? duration.toFixed(3) : duration.toFixed(0);    
                    this.log("write: ...still working on file '"+chunk+"' duration:"+sDuration+" sec ("+nrOfFilesInArchive+" ZIP entries until now...) ");
                }*/
                //var size = entry.size;
                {
                    let extactedfn = path.join(os.tmpdir(), path.basename(chunk.fn) + path.basename(entry.path));
                    entry.pipe(fs.createWriteStream(extactedfn)
                        .on('error', (err:any) => {
                            this.log("write("+chunk.fn+"):ERR !extract("+extactedfn+"):'"+chunk.fn+"' & '"+entry.path+"':\n----------\n"+err+"\n-------------");
                        })
                        .on('finish', () => {

                            mi(extactedfn).then(function(fileinfo:any)
                            {
                                self.pushDescriptionMetas(chunk, fileinfo, new Array());

                            }).catch(function (e:Error) { /*normal case */ })
                            .finally(function()
                            {
                                fs.unlink(extactedfn, function(){});
                            });
                        }));
                }
                entry.autodrain();//has to be after unpacking!
            })
            .on('close', () => {
                //this.log("write("+chunk+"):INF: close file");
                let end:Date = new Date();
                let duration:number = ((end.valueOf() - start.valueOf()) / 1000);
                let sDuration = (duration < 11) ? duration.toFixed(3) : duration.toFixed(0);

                sLogPostFix = "write: END:: listing("+(++this.nrOfArchivesRead)+") file '"+chunk.fn+"' (nrOfFilesInZip:"+nrOfFilesInArchive+") duration:"+sDuration+" sec";
                callbackCalled = this.onTransformEnd(cb2BeCalledOnFinish, callbackCalled, sLogPostFix, true);
            });

        /*Error: incorrect header check at Zlib.zlibOnError [as onerror] (zlib.js:153:17) zlib.unzip(chunk.toString(), (err:Error, data:any) =>*/
    }
    protected pushDescriptionMetas(chunk: Archive, fileinfo:any, pushedMetaValues:Array<String>) : void
    {   /* ...this is the nice solution
        if(!Array.isArray(fileinfo))return;
        for(let name in fileinfo)
        {
            let val = fileinfo[name];
            if(typeof val === 'string')
            {

            }
            else
            {
                this.pushDescriptionMetas(chunk, val, pushedMetaValues);
            }
        }
        */
        /*
        for(let fi1 in fileinfo)
        {
            for(let fi2 in fileinfo[fi1])
            {
                console.log(" fi:'"+fi1+"."+fi2+"' = '"+fileinfo[fi1][fi2]+"'");
            }
        }*/

        if(!fileinfo[0] || !fileinfo[0].general)
        {
            return;
        }

        let g = fileinfo[0].general;

        let pushedMetas:Set<ArchiveContent> = new Set<ArchiveContent>();

       this.pushMeta(g, "title"     , pushedMetas, chunk);
       this.pushMeta(g, "movie_name", pushedMetas, chunk);
       this.pushMeta(g, "performer" , pushedMetas, chunk);
       this.pushMeta(g, "comment"   , pushedMetas, chunk);
    }

    protected pushMeta(fileInfoGeneral:any, sMetaName:string, pushedMetas:Set<ArchiveContent>, chunk:Archive) : boolean
    {
        let aMetaValue:Array<string> = fileInfoGeneral[sMetaName];
        if(!aMetaValue)
        {
            return false;
        }
        
        for(let iMetaValueIndex in aMetaValue)
        {
            let sMetaValue:string = aMetaValue[iMetaValueIndex];

            if(!sMetaValue)continue;

            if(this.isPushed(sMetaValue, pushedMetas))continue;

            var arvhiveFileContent:ArchiveContent = new ArchiveContent(sMetaName, sMetaValue, ArchiveContentType.metadata, chunk.fn);
            this.push(arvhiveFileContent);
            pushedMetas.add(arvhiveFileContent);
        }
        return true;
    }

    protected isPushed(sMetaValue:string, pushedMetas:Set<ArchiveContent>) : boolean
    {
        pushedMetas.forEach((pushedMeta:ArchiveContent) =>
        {
            if(pushedMeta.value == sMetaValue)
            {
                return true;
            }
        });

        return false;
    }

    _final(cb2BeCalledOnFinish?: Function)
    {
        cb2BeCalledOnFinish();
    }
}

export default FileWalkerPipe;
