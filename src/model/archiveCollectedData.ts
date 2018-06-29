import { ArchiveContentType} from './archiveContent';

export class ArchiveCollectedData
{
    constructor(protected words : Map<string, number>, public archiveContentType:ArchiveContentType)
    {

    }
    getWords(sorted:boolean) : Map<string, number>
    {
        if(!sorted)
        {
            return this.words;
        }
        var sortedWords = new Map([...this.words.entries()].sort((a:[string,number],b:[string,number]) => 
        {
            if(a[1] > b[1])return -1;
            if(a[1] < b[1])return 1;
            return 0;
        }));
        return sortedWords;
    }
}
