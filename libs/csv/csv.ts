import * as fs from 'fs';
import { parse as csvParse } from 'csv-parse/sync';
import { parse } from 'csv-parse';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

export function readFile(filePath:string): any{
    const data = fs.readFileSync(filePath);
    // 先頭行はヘッダ
    return csvParse(data,{from_line: 2});
}

export async function readCsvAsObjects<T>(csvPath: string): Promise<T[]> {
  const results: T[] = [];
  const parser = fs.createReadStream(csvPath).pipe(parse({ columns: true, skip_empty_lines: true }));
  for await (const row of parser as any) {
    results.push(row);
  }
  return results;
}

export async function writeObjectsToCsv(filePath: string, header: {id: string, title: string}[], records: any[]): Promise<void> {
  const csvWriter = createCsvWriter({
    path: filePath,
    header
  });
  await csvWriter.writeRecords(records);
}
