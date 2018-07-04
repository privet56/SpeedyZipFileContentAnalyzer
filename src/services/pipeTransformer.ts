import CfgPipe from "../cfgPipe";
import LoggerPipe from "../loggerPipe";
import { Readable, Transform, Duplex, TransformOptions } from 'stream';

export enum LogTransformFrequency
{
    IFFORCED="IFFORCED",
    IFCONCURRENTTRANSFORM="IFCONCURRENTTRANSFORM",
    ALWAYS="ALWAYS"
}


export class PipeTransform extends Transform
{
    protected nrOfTransformsCurrently:number = 0;
    protected logAllTransformStartsAndEnds:LogTransformFrequency = LogTransformFrequency.IFCONCURRENTTRANSFORM;//TODO: make it configurable

    constructor(opts: TransformOptions, protected cfgPipe:CfgPipe, protected loggerPipe:LoggerPipe)
    {
        super(opts);
    }
    log(s:string) : void
    {
        this.loggerPipe.write(this.constructor.name+":"+s);
    }

    protected onTransformLog(forceLog:boolean, sLog:string) : void
    {
        if(((forceLog)) || 
           ((this.logAllTransformStartsAndEnds == LogTransformFrequency.ALWAYS)) ||
           ((this.logAllTransformStartsAndEnds == LogTransformFrequency.IFCONCURRENTTRANSFORM) && (this.nrOfTransformsCurrently > 1)))
        {
            this.log(sLog);
        }
    }

    protected onTransformStart(sLogPostFix?:string, forceLog?:boolean) : boolean
    {
        this.nrOfTransformsCurrently++;
        this.onTransformLog(forceLog, "onTrStrt(#Transforms:"+this.nrOfTransformsCurrently+")"+(sLogPostFix ? sLogPostFix : ''));
        return false;
    }
    protected onTransformEnd(cb:Function, callbackCalled:boolean, sLogPostFix?:string, forceLog?:boolean) : boolean
    {        
        if( cb && !callbackCalled)
        {
            cb();
            this.nrOfTransformsCurrently--;
        }
        callbackCalled = true;
        this.onTransformLog(forceLog, "onTrEnd:(#Transforms:"+this.nrOfTransformsCurrently+")"+(sLogPostFix ? sLogPostFix : ''));
        return true;
    }
}
