import supabase from '../../libs/supabase/supabase';
import { DisplayParkHoop, ParkHoop, Values } from '../models/parkHoop';

export async function getAll(): Promise<ParkHoop[]> {
  const { data, error } = await supabase.from('park_hoop').select();

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }

  return data;
}

export async function getDisplayParkHoopsByParkIds(parkIds: number[]): Promise<DisplayParkHoop[]> {
  const { data, error } = await supabase
    .from('park_hoop')
    .select(
      `
            hoop_id,
            park_id,
            hoop_count,
            hoop_type
        `,
    )
    .in('park_id', parkIds);

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }

  return data;
}

export async function getParkIdByHoopTypes(hoopTypes: number[]): Promise<number[]> {
  const { data, error } = await supabase
    .from('park_hoop')
    .select(
      `
            hoop_id,
            park_id,
            hoop_count,
            hoop_type
        `,
    )
    .in('hoop_type', hoopTypes);

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }

  return data.map((it) => it.park_id);
}

export async function getDisplayParkHoopsByParkId(parkId: number): Promise<DisplayParkHoop[]> {
  const { data, error } = await supabase
    .from('park_hoop')
    .select(
      `
            hoop_id,
            park_id,
            hoop_count,
            hoop_type
        `,
    )
    .eq('park_id', parkId);

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }

  return data;
}

export async function insertParkHoops(parkHoop: ParkHoop): Promise<DisplayParkHoop[]> {
  const { data, error } = await supabase.from('park_hoop').insert(parkHoop);

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }

  return [];
}
