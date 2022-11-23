import supabase from '../../libs/supabase/supabase';
import { Court } from '../models/court';

export async function getCourtAll(): Promise<Court[]> {
  const { data, error } = await supabase.from('court').select();

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }

  return data;
}
