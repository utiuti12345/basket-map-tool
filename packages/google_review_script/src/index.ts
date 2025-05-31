import { DisplayPark } from '../../../domain/models/park';
import { getOutdoorPark, getAllPark } from '../../../domain/repositories/parks';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import axios from 'axios';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { insertParkReviewsBulk } from '../../../domain/repositories/parkReviews';
import { ParkReviewInsert } from '../../../domain/models/parkReview';
import { readCsvAsObjects, writeObjectsToCsv } from '../../../libs/csv/csv';

dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set');
}

const API_KEY = process.env.GOOGLE_API_KEY;
const OUTPUT_CSV = 'tokyo_parks_with_reviews.csv';

interface ReviewResult {
  park_name: string;
  google_name: string | null;
  google_address: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  place_id: string | null;
  json: string | null;
}

// Supabaseインポート用
async function importParkReviewsToSupabase() {
  const parks = await getAllPark();
  const parkNameToId: Record<string, number> = {};
  parks.forEach((row) => {
    parkNameToId[row.park_name] = row.park_id;
  });

  const csvPath = path.join(__dirname, '../output/tokyo_parks_with_reviews.csv');
  type CsvRow = {
    park_name: string;
    google_name: string;
    google_address: string;
    rating: string;
    user_ratings_total: string;
    json: string;
  };
  const rows = await readCsvAsObjects<CsvRow>(csvPath);

  const reviews: ParkReviewInsert[] = [];
  for (const row of rows) {
    const park_id = parkNameToId[row.park_name];
    if (!park_id) {
      console.log(`park_id not found for park_name: ${row.park_name}`);
      continue;
    }
    if (!row.rating) {
      console.log(`rating not found for park_name: ${row.park_name}`);
      continue;
    }
    let jsonData = null;
    try {
      jsonData = row.json ? JSON.parse(row.json) : null;
    } catch (e) {
      console.log(`Invalid JSON for park_name: ${row.park_name}`);
    }
    const rating = row.rating ? parseFloat(row.rating) : null;
    const user_ratings_total = row.user_ratings_total ? parseInt(row.user_ratings_total, 10) : null;

    const place_id = row.json ? (() => {
      try {
        const parsed = JSON.parse(row.json);
        return parsed.results && parsed.results[0] ? parsed.results[0].place_id : null;
      } catch {
        return null;
      }
    })() : null;
    
    const review: ParkReviewInsert = {
      park_id,
      rating,
      user_ratings_total,
      place_id,
      json: jsonData,
    };
    reviews.push(review);
  }
  try {
    await insertParkReviewsBulk(reviews);
    console.log(`Bulk inserted ${reviews.length} reviews!`);
  } catch (error: any) {
    console.log(`Bulk insert error:`, error.message);
  }
  console.log('Import finished!');
}

async function fetchGoogleReviews() {
  const parks: DisplayPark[] = await getOutdoorPark();
  const results: ReviewResult[] = [];

  for (const park of parks.slice(500, 1221)) {
    const query = `${park.park_name} ${park.address} 東京`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}&language=ja`;
    try {
      const resp = await axios.get(url);
      const data = resp.data;
      let rating: number | null = null, user_ratings_total: number | null = null, google_name: string | null = null, google_address: string | null = null, place_id: string | null = null;
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        rating = result.rating ?? null;
        user_ratings_total = result.user_ratings_total ?? null;
        google_name = result.name ?? null;
        google_address = result.formatted_address ?? null;
        place_id = result.place_id ?? null;
      }
      results.push({
        park_name: park.park_name,
        google_name,
        google_address,
        rating,
        user_ratings_total,
        place_id,
        json: JSON.stringify(data)
      });
      console.log(`${park.park_name}: ${rating} (${user_ratings_total})`);
    } catch (e: any) {
      console.error(`${park.park_name} でエラー:`, e.message);
      results.push({
        park_name: park.park_name,
        google_name: null,
        google_address: null,
        rating: null,
        user_ratings_total: null,
        place_id: null,
        json: null
      });
    }
    await new Promise(r => setTimeout(r, 1000)); // レートリミット対策
  }

  // レビュー順でソート（降順）
  results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const header = [
    {id: 'park_name', title: 'park_name'},
    {id: 'google_name', title: 'google_name'},
    {id: 'google_address', title: 'google_address'},
    {id: 'rating', title: 'rating'},
    {id: 'user_ratings_total', title: 'user_ratings_total'},
    {id: 'json', title: 'json'}
  ];
  await writeObjectsToCsv(OUTPUT_CSV, header, results);
  console.log('完了しました。tokyo_parks_with_reviews.csv をご確認ください。');
}

// コマンド引数で分岐
const mode = process.argv[2];
if (mode === 'import') {
  importParkReviewsToSupabase();
} else {
  fetchGoogleReviews();
} 