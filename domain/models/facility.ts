import {
  DisplayPark,
  getAddress,
  getAvailableTimeName,
  getBasketGoalTags,
  getCostName,
  getCourtName,
  getMemo,
  getTell,
  getWeb,
} from './park';

export interface Model {
  id: string;
  facilityName: string;
  court: string;
  basketHoop: string;
  cost: string;
  availableTime: string;
  address: string;
  tell: string;
  webPage: string;
  memo: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  requestDeletion: boolean;
  createdAt: string;
  updateAt: string;
}

export interface Values {
  facilityName: string;
  court: string;
  basketHoop: string;
  cost: string;
  availableTime: string;
  address: string;
  tell: string;
  webPage: string;
  memo: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  requestDeletion: boolean;
}

export function factory(values: Values): Model {
  const now = new Date().toISOString();

  return {
    id: '1111',
    facilityName: values.facilityName,
    court: values.court,
    basketHoop: values.basketHoop,
    cost: values.cost,
    availableTime: values.availableTime,
    address: values.address,
    tell: values.tell,
    webPage: values.webPage,
    memo: values.memo,
    latitude: values.latitude,
    longitude: values.longitude,
    imageUrl: values.imageUrl,
    requestDeletion: values.requestDeletion,
    createdAt: now,
    updateAt: now,
  };
}

export function change(facility: Model, newValues: Values) {
  const now = new Date().toISOString();

  return {
    ...facility,
    ...newValues,
    updateAt: now,
  };
}

// export functions shareMessage(facility:Model):string{
//     return `[${facility.facilityName}]
//
// コート情報：${facility.court}
// リング情報：${facility.basketHoop}
// 料金：${facility.cost}
// 利用時間：${facility.availableTime}
// 住所：${facility.address}
// 電話番号：${facility.tell}
// WEBページ：${facility.webPage}
// 備考：${facility.memo}
//
// https://maps.google.co.jp/maps?q=${facility.latitude},${facility.longitude}`;
// }

export function shareMessage(park: DisplayPark): string {
  return `[${park.park_name}]
    
コート情報：${getCourtName(park)}
リング情報：${getBasketGoalTags(park.park_hoop)}
料金：${getCostName(park)}
利用時間：${getAvailableTimeName(park)}
住所：${getAddress(park)}
電話番号：${getTell(park)}
WEBページ：${getWeb(park)}
備考：${getMemo(park)}

https://maps.google.co.jp/maps?q=${park.latitude},${park.longitude}`;
}
