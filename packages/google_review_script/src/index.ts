import { DisplayPark } from '../../../domain/models/park';
import { getAllDisplayPark, getOutdoorPark } from '../../../domain/repositories/parks';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';
import axios from 'axios';

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
  json: string | null;
}

async function main() {
  const parks: DisplayPark[] = await getOutdoorPark();
  const results: ReviewResult[] = [];

  for (const park of parks.slice(500, 1221)) {
    const query = `${park.park_name} ${park.address} 東京`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}&language=ja`;
    try {
      const resp = await axios.get(url);
      const data = resp.data;
      let rating: number | null = null, user_ratings_total: number | null = null, google_name: string | null = null, google_address: string | null = null;
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        rating = result.rating ?? null;
        user_ratings_total = result.user_ratings_total ?? null;
        google_name = result.name ?? null;
        google_address = result.formatted_address ?? null;
      }
      results.push({
        park_name: park.park_name,
        google_name,
        google_address,
        rating,
        user_ratings_total,
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
        json: null
      });
    }
    await new Promise(r => setTimeout(r, 1000)); // レートリミット対策
  }

  // レビュー順でソート（降順）
  results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const csvWriter = createCsvWriter({
    path: OUTPUT_CSV,
    header: [
      {id: 'park_name', title: 'park_name'},
      {id: 'google_name', title: 'google_name'},
      {id: 'google_address', title: 'google_address'},
      {id: 'rating', title: 'rating'},
      {id: 'user_ratings_total', title: 'user_ratings_total'},
      {id: 'json', title: 'json'}
    ]
  });

  await csvWriter.writeRecords(results);
  console.log('完了しました。tokyo_parks_with_reviews.csv をご確認ください。');
}

main(); 