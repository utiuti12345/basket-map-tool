import supabase from '../../libs/supabase/supabase';
import { ParkReviewInsert } from '../models/parkReview';

export async function insertParkReview(review: ParkReviewInsert): Promise<void> {
  const { error } = await supabase
    .from('park_review')
    .insert([review]);
  if (error) {
    throw new Error(error.message);
  }
}

export async function insertParkReviewsBulk(reviews: ParkReviewInsert[]): Promise<void> {
  const { error } = await supabase
    .from('park_review')
    .insert(reviews);
  if (error) {
    throw new Error(error.message);
  }
} 