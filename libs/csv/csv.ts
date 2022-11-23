import fs from 'fs';
import { parse as csvParse } from 'csv-parse/sync';

export function readFile(filePath:string): any{
    const data = fs.readFileSync(filePath);
    // 先頭行はヘッダ
    return csvParse(data,{from_line: 2});
}
