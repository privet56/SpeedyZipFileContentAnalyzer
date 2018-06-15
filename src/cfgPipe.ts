const fs = require('fs');
import { Readable, Transform, Writable, Duplex } from 'stream';
const nopt = require('nopt');
const parsed = nopt({}, {}, process.argv, 2);

class CfgPipe extends Readable
{
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
                    var cfgobj = JSON.parse(cfg);
                    if( cfgobj && cfgobj.dir)
                        return this.pushCfgEntry(cfgobj.dir, true);
                }
                return this.pushCfgEntry(process.cwd(), true);
            });
        }
    }
};

export default CfgPipe;
