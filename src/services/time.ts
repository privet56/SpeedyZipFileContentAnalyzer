export class Time
{
    protected start:Date = new Date();

    constructor()
    {

    }
    to() : string
    {
        let end:Date = new Date();
        let duration:number = ((end.valueOf() - this.start.valueOf()) / 1000);
        let sDuration = (duration < 11) ? duration.toFixed(3) : duration.toFixed(0);
        return sDuration + " sec";
    }
}
