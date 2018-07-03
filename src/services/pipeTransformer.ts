import CfgPipe from "../cfgPipe";
import LoggerPipe from "../loggerPipe";
import { Readable, Transform, Duplex, TransformOptions } from 'stream';

export class PipeTransform extends Transform
{
    protected nrOfTransformsCurrently:number = 0;
    protected logAllTransformStartsAndEnds:boolean = false;

    constructor(opts: TransformOptions, protected cfgPipe:CfgPipe, protected loggerPipe:LoggerPipe)
    {
        super(opts);
    }
    log(s:string) : void
    {
        this.loggerPipe.write(this.constructor.name+":"+s);
    }
    protected onTransformStart(sLogPostFix?:string, forceLog?:boolean) : boolean
    {
        this.nrOfTransformsCurrently++;

        if(forceLog || this.logAllTransformStartsAndEnds)
        {
            this.log("onTrStrt(#Transforms:"+this.nrOfTransformsCurrently+")"+(sLogPostFix ? sLogPostFix : ''));
        }
        return false;
    }
    protected onTransformEnd(cb:Function, callbackCalled:boolean, sLogPostFix?:string, forceLog?:boolean) : boolean
    {        
        if( cb && !callbackCalled)
        {
            cb();
        }
        callbackCalled = true;
        this.nrOfTransformsCurrently--;

        if(forceLog || this.logAllTransformStartsAndEnds)
        {
            this.log("onTrEnd:(#Transforms:"+this.nrOfTransformsCurrently+")"+(sLogPostFix ? sLogPostFix : ''));
        }

        return true;
    }
}
