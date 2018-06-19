const fs = require('fs');
import { Readable, Transform, Writable, Duplex } from 'stream';
const nopt = require('nopt');
const parsed = nopt({}, {}, process.argv, 2);

class CfgPipe extends Readable
{
    protected cfgContent:any = {};

    constructor()
    {
        super();
    }
    pushCfgEntry(cmd:any, end:boolean) : void
    {
        this.push(cmd);
        if(end)this.push(null);//=end
    }
    _read(size:number) : void
    {
        let cmd:string = parsed.argv.remain.shift();//TODO: if(!cmd)cmd = fromCfg
        if (cmd) return this.pushCfgEntry(cmd, true);

        {   //no cmd -> cfg!
            //fs.readFile('cfg.json', function read(err:Error, cfg:any) //use better =>-style to retain this context
            fs.readFile('cfg.json', (err:Error, cfg:any) =>
            {
                if(!err)
                {
                    this.cfgContent = JSON.parse(cfg);
                    if(!this.cfgContent)
                        this.cfgContent = {};
                    if( this.cfgContent && this.cfgContent.dir)
                        return this.pushCfgEntry(this.cfgContent.dir, true);
                }
                return this.pushCfgEntry(process.cwd(), true);
            });
        }
    }
    getString(cfgEntryName:string, defaultValue:string) : string
    {
        if(!this.cfgContent)return defaultValue;
        if(!this.cfgContent[cfgEntryName])return defaultValue;
        return this.cfgContent[cfgEntryName];
    }
};

export default CfgPipe;
