import supabase from '../../libs/supabase/supabase';
import { DisplayPark, factoryDisplayPark, Park } from '../models/park';

import * as citiesRepository from './cities';
import * as parkHoopsRepository from './parkHoops';
import * as courtRepository from './court';
import { convertStringToNull, isNullUndefined, undefinedToNull } from '../../utils/utils';
import {
  COURT_TYPE_ASPHALTCOAT,
  COURT_TYPE_CLAYCOAT,
  COURT_TYPE_CONCRETECOAT,
  COURT_TYPE_GRASSCOAT,
  COURT_TYPE_SANDCOAT,
  COURT_TYPE_STREETCOAT,
  HOOP_TYPE_MINI,
  HOOP_TYPE_NORMAL,
  OFF,
  ON,
} from '../../constants/constants';
import { getUrl } from '../../libs/storage/storage';

export async function getAllDisplayPark(): Promise<DisplayPark[]> {
  const { data, error } = await supabase
    .from('park')
    .select(
      `
            park_id,
            park_name,
            court_type,
            court(court_name),
            is_free,
            available_time,
            city_id,
            city(city_name),
            address,
            tell,
            web_page,
            image_url,
            memo,
            latitude,
            longitude,
            request_deletion,
            is_delete,
            created_at,
            update_at
        `,
    )
    .eq('is_delete', OFF);

  if (error) {
    console.log('error');
    throw error;
  }

  if (!data) {
    return [];
  } else {
    const cityIds = data.map((park) => (park.city_id === undefined ? 0 : park.city_id));
    const parkIds = data.map((park) => (park.park_id === undefined ? 0 : park.park_id));

    const cityPrefectures = await citiesRepository.getCityPrefectureByCityIds(cityIds);
    const displayParkHoops = await parkHoopsRepository.getDisplayParkHoopsByParkIds(parkIds);
    const courts = await courtRepository.getCourtAll();

    const displayParks = Promise.all(
      data.map(async (park) => {
        const cityPrefecture = cityPrefectures.find((cityPre) => cityPre.city_id == park.city_id);
        const displayParkHoop = displayParkHoops.filter(
          (dispParkHoop) => dispParkHoop.park_id === park.park_id,
        );
        const court = courts.find((court) => court.court_type === park.court_type);
        const imageUrl = await getPublicUrl(park?.image_url);

        return factoryDisplayPark(park, displayParkHoop, court, cityPrefecture, imageUrl);
      }),
    );

    return displayParks;
  }

  return [];
}

export async function getDisplayParkByCityIds(cityIds: number[]): Promise<DisplayPark[]> {
  const { data, error } = await supabase
    .from('park')
    .select(
      `
            park_id,
            park_name,
            court_type,
            court(court_name),
            is_free,
            available_time,
            city_id,
            city(city_name),
            address,
            tell,
            web_page,
            image_url,
            memo,
            latitude,
            longitude,
            request_deletion,
            is_delete,
            created_at,
            update_at
        `,
    )
    .in('city_id', cityIds)
    .eq('is_delete', OFF);

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  } else {
    const cityIds = data.map((park) => (park.city_id === undefined ? 0 : park.city_id));
    const parkIds = data.map((park) => (park.park_id === undefined ? 0 : park.park_id));

    const cityPrefectures = await citiesRepository.getCityPrefectureByCityIds(cityIds);
    const displayParkHoops = await parkHoopsRepository.getDisplayParkHoopsByParkIds(parkIds);
    const courts = await courtRepository.getCourtAll();

    const displayParks = Promise.all(
      data.map(async (park) => {
        const cityPrefecture = cityPrefectures.find((cityPre) => cityPre.city_id == park.city_id);
        const displayParkHoop = displayParkHoops.filter(
          (dispParkHoop) => dispParkHoop.park_id === park.park_id,
        );
        const court = courts.find((court) => court.court_type === park.court_type);
        const imageUrl = await getPublicUrl(park?.image_url);

        return factoryDisplayPark(park, displayParkHoop, court, cityPrefecture, imageUrl);
      }),
    );

    return displayParks;
  }

  return [];
}

export async function getAllParkId(): Promise<number[]> {
  const { data, error } = await supabase
    .from('park')
    .select(
      `
            park_id
        `,
    )
    .eq('is_delete', OFF);

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  // @ts-ignore
    return data;
}

export async function getDisplayParkByParkId(parkId: number): Promise<DisplayPark | null> {
  const { data, error } = await supabase
    .from('park')
    .select(
      `
            park_id,
            park_name,
            court_type,
            court(court_name),
            is_free,
            available_time,
            city_id,
            city(city_name),
            address,
            tell,
            web_page,
            image_url,
            memo,
            latitude,
            longitude,
            request_deletion,
            is_delete,
            created_at,
            update_at
        `,
    )
    .eq('park_id', parkId)
    .eq('is_delete', OFF)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  } else {
    const park = data;

    const cityId = isNullUndefined(park.city_id) ? 0 : park.city_id;
    const parkId = isNullUndefined(park.park_id) ? 0 : park.park_id;

    const cityPrefecture = await citiesRepository.getCityPrefectureByCityId(cityId!);
    const displayParkHoop = await parkHoopsRepository.getDisplayParkHoopsByParkId(parkId);
    const courts = await courtRepository.getCourtAll();

    const court = courts.find((court) => court.court_type === park.court_type);
    const imageUrl = await getPublicUrl(park?.image_url);

    const displayParks = factoryDisplayPark(park, displayParkHoop, court, cityPrefecture, imageUrl);

    return displayParks;
  }

  return null;
}

export async function getDisplayParkBySearch(
  prefectureId: number,
  cityId: number,
  parkName?: string,
  normalGoal?: boolean,
  miniGoal?: boolean,
  streetCoat?: boolean,
  clayCoat?: boolean,
  sandCoat?: boolean,
  concreteCoat?: boolean,
  asphaltCoat?: boolean,
  grassCoat?: boolean,
  paid?: boolean,
  free?: boolean,
): Promise<DisplayPark[]> {
  const { data, error } = await supabase
    .rpc('get_display_parks_by_search', {
      param_prefecture_id: prefectureId,
      param_city_id: cityId,
      param_park_name: convertStringToNull(parkName),
    })
    .select(
      `
            park_id,
            park_name,
            court_type,
            court_name,
            is_free,
            available_time,
            city_id,
            city_name,
            address,
            tell,
            web_page,
            image_url,
            memo,
            latitude,
            longitude,
            request_deletion,
            is_delete,
            created_at,
            update_at
        `,
    );

  let hoopTypeArray: number[] = [];
  if (normalGoal) {
    hoopTypeArray = [...hoopTypeArray, HOOP_TYPE_NORMAL];
  }

  if (miniGoal) {
    hoopTypeArray = [...hoopTypeArray, HOOP_TYPE_MINI];
  }

  let courtTypeArray: number[] = [];
  if (streetCoat) {
    courtTypeArray = [...courtTypeArray, COURT_TYPE_STREETCOAT];
  }

  if (clayCoat) {
    courtTypeArray = [...courtTypeArray, COURT_TYPE_CLAYCOAT];
  }

  if (sandCoat) {
    courtTypeArray = [...courtTypeArray, COURT_TYPE_SANDCOAT];
  }

  if (concreteCoat) {
    courtTypeArray = [...courtTypeArray, COURT_TYPE_CONCRETECOAT];
  }

  if (asphaltCoat) {
    courtTypeArray = [...courtTypeArray, COURT_TYPE_ASPHALTCOAT];
  }

  if (grassCoat) {
    courtTypeArray = [...courtTypeArray, COURT_TYPE_GRASSCOAT];
  }

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  } else {
    const parkIdsFilterByHoopTypes = await parkHoopsRepository.getParkIdByHoopTypes(hoopTypeArray);

    let parks = data.reduce((prev: Park[], current: Park): Park[] => {
      let parks = prev;
      // どれかの条件が設定されている場合
      if (hoopTypeArray.length > 0 || courtTypeArray.length > 0 || paid || free) {
        //ゴールの特徴の検索条件
        if (hoopTypeArray.length > 0) {
          if (parkIdsFilterByHoopTypes.includes(current.park_id)) {
            parks = [...parks, current];
          } else {
            parks = [...parks];
          }
        }

        //コートの特徴の検索条件
        if (courtTypeArray.length > 0) {
          if (
            !isNullUndefined(current.court_type) &&
            courtTypeArray.includes(current.court_type!)
          ) {
            parks = [...parks, current];
          } else {
            parks = [...parks];
          }
        }

        //費用の特徴・有料の検索条件
        if (paid) {
          if (!isNullUndefined(current.is_free) && !current.is_free) {
            parks = [...parks, current];
          } else {
            parks = [...parks];
          }
        }

        //費用の特徴・無料の検索条件
        if (free) {
          if (!isNullUndefined(current.is_free) && current.is_free) {
            parks = [...parks, current];
          } else {
            parks = [...parks];
          }
        }
      } else {
        parks = [...parks, current];
      }

      return parks;
    }, []);

    const cityIds = parks.map((park) => (park.city_id === undefined ? 0 : park.city_id));
    const parkIds = parks.map((park) => (park.park_id === undefined ? 0 : park.park_id));

    const cityPrefectures = await citiesRepository.getCityPrefectureByCityIds(cityIds);
    const displayParkHoops = await parkHoopsRepository.getDisplayParkHoopsByParkIds(parkIds);
    const courts = await courtRepository.getCourtAll();

    const displayParks = Promise.all(
      parks.map(async (park) => {
        const cityPrefecture = cityPrefectures.find((cityPre) => cityPre.city_id == park.city_id);
        const displayParkHoop = displayParkHoops.filter(
          (displayParkHoop) => displayParkHoop.park_id === park.park_id,
        );
        const court = courts.find((court) => court.court_type === park.court_type);
        const imageUrl = await getPublicUrl(park?.image_url);

        return factoryDisplayPark(park, displayParkHoop, court, cityPrefecture, imageUrl);
      }),
    );

    return displayParks;
  }

  return [];
}

export async function getPublicUrl(imageUrl?: string): Promise<string | null> {
  if (isNullUndefined(imageUrl)) {
    return null;
  }

  const publicURL = getUrl(imageUrl as string);

  if (!publicURL) {
    return null;
  }

  return publicURL;
}

export async function insert(park: Park): Promise<number> {
  const { data, error } = await supabase
    .from('park')
    .insert({
      park_name: park.park_name,
      court_type: park.court_type,
      is_free: park.is_free,
      city_id: park.city_id,
      available_time: park.available_time,
      address: park.address,
      tell: park.tell,
      web_page: park.web_page,
      image_url: park.image_url,
      memo: park.memo,
      latitude: park.latitude,
      longitude: park.longitude,
      request_deletion: park.request_deletion,
      is_delete: park.is_delete,
      created_at: park.created_at,
      update_at: park.update_at,
    })
    .select();

  if (error) {
    throw error;
  }

  if (data) {
    // @ts-ignore
      return data[0].park_id;
  }

  return 0;
}

export async function update(park: Park): Promise<void> {
  const { data, error } = await supabase
    .from('park')
    .update({
      park_name: park.park_name,
      court_type: park.court_type,
      court_name: park.court_name,
      is_free: park.is_free,
      available_time: park.available_time,
      city_id: park.city_id,
      city_name: park.city_name,
      address: park.address,
      tell: park.tell,
      web_page: park.web_page,
      image_url: park.image_url,
      memo: park.memo,
      latitude: park.latitude,
      longitude: park.longitude,
      request_deletion: park.request_deletion,
      is_delete: park.is_delete,
      created_at: park.created_at,
      update_at: park.update_at,
    })
    .eq('park_id', park.park_id);

  if (error) {
    console.log('エラー');
    console.log(error);
    throw error;
  }

  if (data) {
  }
}

export async function searchByParkName(parkName:string):Promise<Park[]> {
    const { data, error } = await supabase
        .from('park')
        .select()
        .like('park_name', '%'+ parkName + '%');

    if (error) {
        console.log('エラー');
        console.log(error);
        throw error;
    }

    if (data) {
        return data;
    }
    return [];
}

export async function uploadParkImage(parkId: number, ): Promise<void> {

}
