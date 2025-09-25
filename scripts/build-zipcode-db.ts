// scripts/build-zipcode-db.ts
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";

// ------------------------------------------------------------------
// Types – keep them in sync with the shared schema
// ------------------------------------------------------------------
export interface CsvRow {
  zip: string;
  city: string;
  state: string;
  latitude: string;   // CSV gives us strings; we'll convert to numbers
  longitude: string;
}

// The shape we store in the app – a *partial* location (city/state/country may be missing)
export interface StoredLocation {
  id: string;            // we’ll use the zip code as a stable ID
  name: string;          // “City, ST”
  zipCode: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

// ------------------------------------------------------------------
// 1️⃣ Read the CSV file (relative to the script folder)
// ------------------------------------------------------------------
const csvPath = join(__dirname, "data", "uszips.csv");
const rawCsv = readFileSync(csvPath, "utf8");

// ------------------------------------------------------------------
// 2️⃣ Parse it – the file has a header row, so `columns: true`
// ------------------------------------------------------------------
const records: CsvRow[] = parse(rawCsv, {
  columns: true,
  skip_empty_lines: true,
});

// ------------------------------------------------------------------
// 3️⃣ Transform each row into the shape we store
// ------------------------------------------------------------------
const locations: StoredLocation[] = records.map((row) => ({
  id: row.zip,                                 // unique key
  name: `${row.city}, ${row.state}`,           // human‑readable label
  zipCode: row.zip,
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),

  // Optional address fields – we keep them because the CSV already has them.
  // If you ever want to omit them, just delete these three lines.
  city: row.city,
  state: row.state,
  country: "US",                               // static for this dataset
}));

// ------------------------------------------------------------------
// 4️⃣ Write the JSON file that the app will import at runtime
// ------------------------------------------------------------------
const outPath = join(__dirname, "..", "src", "data", "locations.json");
writeFileSync(outPath, JSON.stringify(locations, null, 2), "utf8");

console.log(`✅ Wrote ${locations.length} locations to ${outPath}`);