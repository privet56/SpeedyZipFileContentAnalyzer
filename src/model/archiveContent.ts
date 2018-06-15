export enum ArchiveContentType
{
    name="name",
    metadata="metadata",
    content="content"
}

export class ArchiveContent
{
    constructor(public name:string, public value:string, public type:ArchiveContentType, origin:string)
    {

    }
}
