import CfgPipe from "../cfgPipe";
import LoggerPipe from "../loggerPipe";
import { Readable, Transform, Duplex, TransformOptions } from 'stream';

export class PipeTransform extends Transform
{
    constructor(opts: TransformOptions, protected cfgPipe:CfgPipe, protected loggerPipe:LoggerPipe)
    {
        super(opts);
    }
    log(s:string) : void
    {
        this.loggerPipe.write(this.constructor.name+":"+s);
    }
}

/*usage: derive from it:
import { PipeTransform } from "./services/pipeTransformer";
class DirWalkerPipe extends PipeTransform
{
    constructor(cfgPipe:CfgPipe, loggerPipe:LoggerPipe)
    {
        super({readableObjectMode:true}, cfgPipe, loggerPipe);
    }
    _transform(chunk: any, encoding?: string, cb?: Function) : void
    {
        this.log("pushing:"+fn);
*/
