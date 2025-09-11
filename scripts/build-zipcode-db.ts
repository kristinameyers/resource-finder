import fs from 'fs';
import { parse } from 'csv-parse/sync';

const csv: string = fs.readFileSync('scripts/data/uszips.csv', 'utf8');
const records = parse(csv, { columns: true }) as Array<Record<string,string>>;
const zipMap: Record<string, [number, number]> = {};

for (const r of records) {
  const zip = r.zip.padStart(5, '0');
  const lat = parseFloat(r.lat);
  const lng = parseFloat(r.lng);
  zipMap[zip] = [lat, lng];
}

fs.writeFileSync(
  'src/data/zipcode-db.json',
  JSON.stringify(zipMap),
  'utf8'
);
