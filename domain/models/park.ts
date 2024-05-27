import {Court} from './court';
import {City, CityPrefecture} from './city';
import {isNullUndefined, undefinedToNull} from '../../utils/utils';
import {DisplayParkHoop, ParkHoop} from './parkHoop';
import {
  COURT_TYPE_ASPHALTCOAT,
  COURT_TYPE_CLAYCOAT,
  COURT_TYPE_COAT,
  COURT_TYPE_CONCRETECOAT,
  COURT_TYPE_GRASSCOAT,
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
  parkHoop: ParkHoop[];
  imageUrl: string | null;
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

export async function convertToModel(parseData: any, prefectureId: number): Promise<insertPark[]> {
  const cities = await CitiesRepository.getAll();
  //const displayParks = await ParksRepository.getAllDisplayPark();

  return await Promise.all(await parseData.map(async (item: any) => {
    const cityValues = await convertToAddress(item[5], cities);
    console.log(`${cityValues.city_id}\t${cityValues.address}\t${cityValues.latitude}\t${cityValues.longitude}`);
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
      memo: undefined,
      latitude: cityValues.latitude,
      longitude: cityValues.longitude,
    }
    const parkHoops = item[2] === 'つ' ? null : [{
      hoop_id: 0,
      park_id: 0,
      hoop_count: item[2].replace('つ', '') as number,
      hoop_type: 0,
    }]
    return {
      park: factory(values),
      parkHoop: parkHoops,
      imageUrl: item[8] === undefined ? null : item[8]
    }
  }));
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
      .replace(/(...??[都道府県])((?:旭川|伊達|石狩|盛岡|奥州|田村|南相馬|那須塩原|東村山|武蔵村山|羽村|十日町|上越|富山|野々市|大町|蒲郡|四日市|姫路|大和郡山|廿日市|下松|岩国|田川|大村|宮古|富良野|別府|佐伯|黒部|小諸|塩尻|玉野|周南)市|(?:余市|高市|[^市]{2,3}?)郡(?:玉村|大町|.{1,5}?)[町村]|(?:.{1,4}市)?[^町]{1,4}?区|.{1,7}?[市町村])(.+)/, "$1 $2 $3")
      .split(' ')
  if(substrAddress.length > 0){
    // const postCode = substrAddress[0];
    // const prefecture = substrAddress[1];
    // let city = substrAddress[2];
    // let address = substrAddress[3];
    const prefecture = substrAddress[0];
    let city = substrAddress[1];
    let address = substrAddress[2];

    // console.log(prefecture);
    // console.log(city);
    // console.log(address);
    // if(city.includes('さいたま市')){
    //   const tempAddress = city.replace('さいたま市','');
    //   address = tempAddress + address;
    //   city = 'さいたま市';
    // }
    //
    // if(city.includes('千葉市')){
    //   const tempAddress = city.replace('千葉市','');
    //   address = tempAddress + address;
    //   city = '千葉市';
    // }
    //
    // if(city.includes('大阪市')){
    //   const tempAddress = city.replace('大阪市','');
    //   address = tempAddress + address;
    //   city = '大阪市';
    // }
    //
    // if(city.includes('堺市')){
    //   const index = city.indexOf('市')
    //   const tempAddress = city.replace('堺市','');
    //   address = tempAddress + address;
    //   city = '堺市';
    // }

    const geocode = await addressConvertToGeocode(prefecture + city + address);
    // console.log(prefecture + city + address);
    // console.log(`${geocode?.latitude} ${geocode?.longitude}`);
    console.log(city);
    const cityModel = cities.filter((it) => {
      if (city !== undefined){
        if(city.includes('伊奈町')){
          return it.city_id === 557
        }
        if(city.includes('小川町')){
          return it.city_id === 563
        }
        if (city.includes('遠賀郡')){
          city = city.replace('遠賀郡','');
        }
        if (city.includes('京都郡')){
          city = city.replace('京都郡','');
        }
        if (city.includes('鞍手郡')){
          city = city.replace('鞍手郡','');
        }
        if (city.includes('糟屋郡')){
          city = city.replace('糟屋郡','');
        }
        if (city.includes('田川郡')){
          city = city.replace('田川郡','');
        }
        if (city.includes('築上郡')){
          city = city.replace('築上郡','');
        }
        if (city.includes('嘉穂郡')){
          city = city.replace('嘉穂郡','');
        }
        if (city.includes('西松浦郡')){
          city = city.replace('西松浦郡','');
        }
        if (city.includes('杵島郡')){
          city = city.replace('杵島郡','');
        }
        if (city.includes('三養基郡')){
          city = city.replace('三養基郡','');
        }
        if (city.includes('朝倉郡')){
          city = city.replace('朝倉郡','');
        }
        if (city.includes('藤津郡')){
          city = city.replace('藤津郡','');
        }
        if (city.includes('神埼郡')){
            city = city.replace('神埼郡','');
        }
        if (city.includes('西彼杵郡')){
            city = city.replace('西彼杵郡','');
        }
        if (city.includes('中頭郡')){
          city = city.replace('中頭郡','');
        }


        if (city.includes('福岡市')){
          if (city.includes('城南区')){
            city = city.replace('城南区','');
            address = "城南区" + address;
          }
          if (city.includes('東区')){
            city = city.replace('東区','');
            address = "東区" + address;
          }
          if (city.includes('南区')){
            city = city.replace('南区','');
            address = "南区" + address;
          }
          if (city.includes('中央区')){
            city = city.replace('中央区','');
            address = "中央区" + address;
          }
          if (city.includes('早良区')){
            city = city.replace('早良区','');
            address = "早良区" + address;
          }
          if (city.includes('西区')){
            city = city.replace('西区','');
            address = "西区" + address;
          }
          if (city.includes('博多区')) {
            city = city.replace('博多区', '');
            address = "博多区" + address;
          }
        }
        if (city.includes('北九州市')){
          if (city.includes('小倉北区')){
            city = city.replace('小倉北区','');
            address = "小倉北区" + address;
          }
          if (city.includes('小倉南区')){
            city = city.replace('小倉南区','');
            address = "小倉南区" + address;
          }
          if (city.includes('八幡東区')){
            city = city.replace('八幡東区','');
            address = "八幡東区" + address;
          }
          if (city.includes('八幡西区')){
            city = city.replace('八幡西区','');
            address = "八幡西区" + address;
          }
          if (city.includes('門司区')){
            city = city.replace('門司区','');
            address = "門司区" + address;
          }
          if (city.includes('若松区')){
            city = city.replace('若松区','');
            address = "若松区" + address;
          }
          if (city.includes('戸畑区')){
            city = city.replace('戸畑区','');
            address = "戸畑区" + address;
          }
        }
        if (city.includes('熊本市')){
            if (city.includes('中央区')){
                city = city.replace('中央区','');
                address = "中央区" + address;
            }
            if (city.includes('東区')){
                city = city.replace('東区','');
                address = "東区" + address;
            }
            if (city.includes('西区')){
                city = city.replace('西区','');
                address = "西区" + address;
            }
            if (city.includes('南区')){
                city = city.replace('南区','');
                address = "南区" + address;
            }
            if (city.includes('北区')){
                city = city.replace('北区','');
                address = "北区" + address;
            }
        }
      }

      return it.city_name == city
    });

    if(cityModel.length === 0){
      console.log('なし');
      console.log(prefecture + city + address);
    }

    return {
      park_name: '',
      court_type: undefined,
      is_free: undefined,
      available_time: undefined,
      city_id: cityModel[0]?.city_id,
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
