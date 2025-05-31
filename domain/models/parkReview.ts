export interface ParkReviewInsert {
  park_id: number;
  rating: number | null;
  user_ratings_total: number | null;
  place_id: string | null;
  json: any;
} 