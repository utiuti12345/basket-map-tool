import { Court } from './court';
import {City, CityPrefecture} from './city';
import { isNullUndefined, undefinedToNull } from '../../utils/utils';
import {DisplayParkHoop, ParkHoop} from './parkHoop';
import {
  COURT_TYPE_ASPHALTCOAT, COURT_TYPE_CLAYCOAT, COURT_TYPE_COAT,
  COURT_TYPE_CONCRETECOAT, COURT_TYPE_GRASSCOAT,
  COURT_TYPE_SANDCOAT,
  COURT_TYPE_STREETCOAT,
  FREE,
  PAID
} from '../../constants/constants';
import {addressConvertToGeocode} from "../../libs/geo/geocode";
import * as CitiesRepository from "../repositories/cities";

export interface Park {
  park_id: number;
  park_name: string;
  court_type?: number;
  court_name?: string;
  is_free?: boolean;
  available_time?: string;
  city_id?: number;
  city_name?: string;
  address?: string;
  tell?: string;
  web_page?: string;
  image_url?: string;
  memo?: string;
  latitude?: number;
  longitude?: number;
  request_deletion: boolean;
  is_delete: boolean;
  created_at: string;
  update_at?: string;
}

export interface Values {
  park_name: string;
  court_type?: number;
  is_free?: boolean;
  available_time?: string;
  city_id?: number;
  address?: string;
  tell?: string;
  web_page?: string;
  image_url?: string;
  memo?: string;
  latitude?: number;
  longitude?: number;
}

export interface DisplayPark {
  park_id: number;
  park_name: string;
  court_type?: number | null;
  court_name?: string | null;
  is_free?: boolean;
  available_time?: string;
  park_hoop: DisplayParkHoop[];
  city_id?: number | null;
  city_name?: string | null;
  address?: string | null;
  tell?: string | null;
  web_page?: string | null;
  image_url?: string | null;
  memo?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  request_deletion: boolean;
  is_delete: boolean;
  created_at: string;
  update_at?: string | null;
}

export interface insertPark {
  park: Park;
  park_hoop: ParkHoop[];
}

export function factoryDisplayPark(
  park: Park,
  displayHoops: DisplayParkHoop[],
  court: Court | undefined,
  cityPrefecture: CityPrefecture | undefined,
  imageUrl: string | null,
): DisplayPark {
  const prefecture = cityPrefecture?.prefecture;

  const courtName = undefinedToNull(park.court_name, court?.court_name);
  const prefectureName = undefinedToNull(prefecture?.prefecture_name, undefined);
  const cityName = undefinedToNull(park.city_name, cityPrefecture?.city_name);
  const address = undefinedToNull(park.address, '');

  return {
    park_id: park.park_id,
    park_name: park.park_name,
    court_type: park.court_type,
    court_name: courtName,
    is_free: park.is_free,
    city_id: park.city_id,
    city_name: cityName,
    available_time: park.available_time,
    park_hoop: displayHoops,
    address: `${prefectureName}${cityName}${address}`,
    tell: park.tell,
    web_page: park.web_page,
    image_url: imageUrl,
    memo: park.memo,
    latitude: park.latitude,
    longitude: park.longitude,
    request_deletion: park.request_deletion,
    is_delete: park.is_delete,
    created_at: park.created_at,
    update_at: park.update_at,
  };
}

export function factory(values: Values): Park {
  const now = new Date().toISOString();

  return {
    park_id: 0,
    park_name: values.park_name,
    court_type: values.court_type,
    is_free: values.is_free,
    city_id: values.city_id,
    available_time: values.available_time,
    address: values.address,
    tell: values.tell,
    web_page: values.web_page,
    image_url: values.image_url,
    memo: values.memo,
    latitude: values.latitude,
    longitude: values.longitude,
    request_deletion: false,
    is_delete: true,
    created_at: now,
    update_at: now,
  };
}

export function getBasketGoalTags(displayHoops: DisplayParkHoop[]): string[] {
  return displayHoops.map((displayHoop) => {
    const isMinibasketGoal = displayHoop.hoop_type === 1;
    return isMinibasketGoal
      ? `ミニバス用ゴール${displayHoop.hoop_count.toString()}基`
      : `ゴール${displayHoop.hoop_count.toString()}基`;
  });
}

export function getTags(displayPark: DisplayPark) {}

// export functions getTagList(displayPark:DisplayPark):string[]{
//
//     return
// }

export function getCourtName(displayPark: DisplayPark): string {
  if (isNullUndefined(displayPark.court_name)) {
    return '---';
  }
  return displayPark.court_name as string;
}

export function getCostName(displayPark: DisplayPark): string {
  if (isNullUndefined(displayPark.is_free)) {
    return '---';
  }
  return displayPark.is_free ? FREE : (PAID as string);
}

export function getAvailableTimeName(displayPark: DisplayPark): string {
  if (isNullUndefined(displayPark.available_time)) {
    return '---';
  }
  return displayPark.available_time as string;
}

export function getAddress(displayPark: DisplayPark): string {
  if (isNullUndefined(displayPark.address)) {
    return '---';
  }
  return displayPark.address as string;
}

export function getTell(displayPark: DisplayPark): string {
  if (isNullUndefined(displayPark.tell)) {
    return '---';
  }
  return displayPark.tell as string;
}

export function getMemo(displayPark: DisplayPark): string {
  if (isNullUndefined(displayPark.memo)) {
    return '---';
  }
  return displayPark.memo as string;
}

export function getWeb(displayPark: DisplayPark): string {
  if (isNullUndefined(displayPark.web_page)) {
    return '---';
  }
  return displayPark.web_page as string;
}

export function getImage(displayPark: DisplayPark): string {
  if (isNullUndefined(displayPark.image_url)) {
    return '';
  }
  return displayPark.image_url as string;
}

export async function convertToModel(parseData: any): Promise<insertPark[]> {
  const cities = await CitiesRepository.getAll();

  const promises = parseData.map(async (item: any) => {
    const cityValues = await convertToAddress(item[5], cities);
    const values: Values = {
      park_name: item[0],
      court_type: convertToCourtType(item[1]),
      is_free: item[3] === "無料" ? true : false,
      available_time: item[4],
      city_id: cityValues.city_id,
      address: cityValues.address,
      tell: item[6],
      web_page: item[7],
      image_url: undefined,
      memo: item[8],
      latitude: cityValues.latitude,
      longitude: cityValues.longitude,
    }
    const parkHoops = item[2] === 'つ' ? null : [{
      hoop_id: 0,
      park_id: 0,
      hoop_count: item[2].replace('つ','') as number,
      hoop_type: 0,
    }]
    return {
      park:factory(values),
      parkHoop:parkHoops,
    }
  })

  return await Promise.all(promises);
}

export function convertToCourtType(courtType:string):number | undefined{
  switch (courtType){
    case '砂' :
      return COURT_TYPE_SANDCOAT;
    case '砂地' :
      return COURT_TYPE_SANDCOAT;
    case 'アスファルト' :
      return COURT_TYPE_ASPHALTCOAT;
    case 'コンクリート' :
      return COURT_TYPE_CONCRETECOAT;
    case '草' :
      return COURT_TYPE_GRASSCOAT;
    case '土' :
      return COURT_TYPE_CLAYCOAT;
    case 'ストリート' :
      return COURT_TYPE_STREETCOAT;
    case '屋内' :
      return COURT_TYPE_COAT;
    default :
      break;
  }
  return undefined;
}

export async function convertToAddress(str:string, cities:City[]):Promise<Values> {
  // 郵便番号
  //const postCode = str.match(/^\d{3}-?\d{4}$/)
  // 郵便番号を取り除く
  //const address = str.replace('〒','').replace(/^\d{3}-?\d{4}$/,'').trim()
  // 県名取り出し
  const substrAddress = str
      .replace(/(...??[都道府県])((?:旭川|伊達|石狩|盛岡|奥州|田村|南相馬|那須塩原|東村山|武蔵村山|羽村|十日町|上越|富山|野々市|大町|蒲郡|四日市|姫路|大和郡山|廿日市|下松|岩国|田川|大村)市|.+?郡(?:玉村|大町|.+?)[町村]|.+?市.+?区|.+?[市区町村])(.+)/, "$1 $2 $3")
      .split(' ')
  if(substrAddress.length > 0){
    const postCode = substrAddress[0];
    const prefecture = substrAddress[1];
    let city = substrAddress[2];
    let address = substrAddress[3];

    console.log(substrAddress);
    if(city.includes('さいたま市')){
      const tempAddress = city.replace('さいたま市','');
      address = tempAddress + address;
      city = 'さいたま市';
    }

    const geocode = await addressConvertToGeocode(prefecture + city + address);
    // console.log(prefecture + city + address);
    // console.log(`${geocode?.latitude} ${geocode?.longitude}`);

    const cityModel = cities.find((it) =>{
      if(city.includes('伊奈町')){
        return it.city_id === 557
      }
      if(city.includes('小川町')){
        return it.city_id === 563
      }
      return it.city_name === city
    });

    if(cityModel !== undefined){
      //console.log(cityModel.city_name);
    }

    return {
      park_name: '',
      court_type: undefined,
      is_free: undefined,
      available_time: undefined,
      city_id: cityModel?.city_id,
      address: address,
      tell: undefined,
      web_page: undefined,
      image_url: undefined,
      memo: undefined,
      latitude: geocode?.latitude,
      longitude: geocode?.longitude,
    }
  }

  return {
    park_name: '',
    court_type: undefined,
    is_free: undefined,
    available_time: undefined,
    city_id: 0,
    address: undefined,
    tell: undefined,
    web_page: undefined,
    image_url: undefined,
    memo: undefined,
    latitude: undefined,
    longitude: undefined,
  }
}
