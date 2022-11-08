import fs from 'fs';
import { parse as csvParse } from 'csv-parse/sync';

export function readFile(filePath:string): any{
    const data = fs.readFileSync(filePath);
    return csvParse(data);
}
