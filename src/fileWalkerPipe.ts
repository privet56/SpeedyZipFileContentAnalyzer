import unzip from "unzip";

import dotenv from "dotenv";
import path from "path";
import bluebird from "bluebird";
var request = require('request');
var zlib = require('zlib');
var tar = require('tar');
import { ArchiveContent, ArchiveContentType } from "./model/archiveContent";
import CfgPipe from "./cfgPipe";
import LoggerPipe from "./loggerPipe";
import { Readable, Transform, Duplex, TransformOptions } from 'stream';

const fs = require('fs');

class FileWalkerPipe extends Transform
{
    protected nrOfArchivesRead:number = 0;

    constructor(protected cfgPipe:CfgPipe, protected loggerPipe:LoggerPipe)
    {
        super({readableObjectMode:true});
    }

    protected callCallBackOnce(cb:Function, callbackCalled:boolean) : boolean
    {
        if( cb && !callbackCalled)
            cb();
        callbackCalled = true;
        return true;
    }

    _write(chunk: any, encoding?: string, cb2BeCalledOnFinish?: Function) : void
    {
        let nrOfFilesInArchive:number = 0;
        let start:Date = new Date();
        let callbackCalled: boolean = false;

        //TODO: skip 0 byte ZIP files!
        //this.loggerPipe.write("FileWalker:write: START listing file '"+chunk+"'");

        fs.createReadStream(chunk)
            .on('error', (err:any) => {
                this.loggerPipe.write("FileWalkerPipe:write("+chunk+"):ERR !fs.createReadStream:\n----------\n"+err+"\n-------------");
                callbackCalled = this.callCallBackOnce(cb2BeCalledOnFinish, callbackCalled);
            })
            .pipe(unzip.Parse())
            .on('error', (err:any) => {
                this.loggerPipe.write("FileWalkerPipe:write("+chunk+"):ERR !unzip.parse:\n----------\n"+err+"\n-------------");
                callbackCalled = this.callCallBackOnce(cb2BeCalledOnFinish, callbackCalled);
            })
            .on('entry',  (entry:unzip.Entry) =>
            {
                entry.autodrain();
                var fileName = entry.path;
                var type = entry.type; // 'Directory' or 'File'
                //this.loggerPipe.write("FileWalkerPipe:write("+chunk+"):INF "+type+" found in archive:>"+fileName+"<");
                var arvhiveFileContent:ArchiveContent = new ArchiveContent(ArchiveContent.name, fileName, ArchiveContentType.name, chunk.toString());
                this.push(arvhiveFileContent);
                nrOfFilesInArchive++;
                if((nrOfFilesInArchive % 1000) === 0)
                {
                    let end:Date = new Date();
                    let duration:number = ((end.valueOf() - start.valueOf()) / 1000);
                    let sDuration = (duration < 11) ? duration.toFixed(3) : duration.toFixed(0);    
                    //this.loggerPipe.write("FileWalker:write: ...still working on file '"+chunk+"' duration:"+sDuration+" sec ("+nrOfFilesInArchive+" ZIP entries until now...) ");
                }
                //var size = entry.size;
                //entry.pipe(fs.createWriteStream('output/path'));
            })
            .on('close', () => {
                //this.loggerPipe.write("FileWalkerPipe:write("+chunk+"):INF: close file");
                let end:Date = new Date();
                let duration:number = ((end.valueOf() - start.valueOf()) / 1000);
                let sDuration = (duration < 11) ? duration.toFixed(3) : duration.toFixed(0);

                this.loggerPipe.write("FileWalker:write: listing("+(++this.nrOfArchivesRead)+") file '"+chunk+"' finished (nrOfFilesInArchive:"+nrOfFilesInArchive+") duration:"+sDuration+" sec");
                callbackCalled = this.callCallBackOnce(cb2BeCalledOnFinish, callbackCalled);
            });

        /*Error: incorrect header check at Zlib.zlibOnError [as onerror] (zlib.js:153:17)
        zlib.unzip(chunk.toString(), (err:Error, data:any) =>
        {
            if (err)
            {
                //throw err;
                this.loggerPipe.write("DirWalkerPipe:write("+chunk+"):ERR:\n----------\n"+err+"\n-------------");
                cb2BeCalledOnFinish();
                return;
            }

            //...work...
            console.log(data);
            this.loggerPipe.write("DirWalkerPipe:write("+chunk+"):INF:\n----------\n"+data+"\n-------------");
            cb2BeCalledOnFinish();
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
            cb2BeCalledOnFinish();
        });
        */
    }
    _final()
    {
        this.push(null);
    }
}

export default FileWalkerPipe;
