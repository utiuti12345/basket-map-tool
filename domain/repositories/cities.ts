import supabase from '../../libs/supabase/supabase';
import { City, CityPrefecture } from '../models/city';

export async function getAll(): Promise<City[]> {
  const { data, error } = await supabase.from('city').select();

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }

  return data;
}

export async function getCitiesByPrefectureId(prefectureId: number): Promise<City[]> {
  const { data, error } = await supabase
    .from('city')
    .select()
    .eq('prefecture_id', prefectureId);

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }

  return data;
}

export async function getCityPrefectureByCityId(cityId: number): Promise<CityPrefecture> {
  const { data, error } = await supabase
    .from('city')
    .select(
      `
            city_id,
            city_name,
            prefecture:prefecture_id ( * )
        `,
    )
    .eq('city_id', cityId)
    .single();

  if (error) {
    throw error;
  }
  if (!data) {
    return {
      prefecture: {
        prefecture_id: 0,
        prefecture_name: '',
        prefecture_name_eng: '',
        prefecture_name_kana: '',
      },
      city_id: 0,
      city_name: '',
    };
  }

  return data;
}

export async function getCityByCityId(cityId: number): Promise<City> {
  const { data, error } = await supabase.from('city').select().eq('city_id', cityId).single();

  if (error) {
    console.log(error);
    throw error;
  }
  if (!data) {
    return { city_id: 0, city_name: '', city_name_kana: '', prefecture_id: 0 };
  }

  return data;
}

export async function getCityPrefectureByCityIds(cityIds: number[]): Promise<CityPrefecture[]> {
  const { data, error } = await supabase
    .from('city')
    .select(
      `
            city_id,
            city_name,
            prefecture:prefecture_id ( * )
        `,
    )
    .in('city_id', cityIds);

  if (error) {
    throw error;
  }
  if (!data) {
    return [];
  }

  return data;
}
