import { ADS_DISPLAY } from '../constants/constants';

export function isNullUndefined<T>(value: T): boolean {
  return value === undefined || value === null;
}

export function undefinedToNull<T, U>(value: T, value2: U): T | U | null {
  return value ? value : value2 ? value2 : null;
}

export function undefinedToEmpty<T>(value: T): T | string {
  return value === undefined ? '' : value;
}

export function convertStringToBoolean(value?: string) {
  if (typeof value != 'string') {
    return Boolean(value);
  }
  try {
    const obj = JSON.parse(value.toLowerCase());
    return obj == true;
  } catch (e) {
    return value != '';
  }
}

export function convertStringToNull(value?: string) {
  if (typeof value != 'string') {
    return null;
  }
  try {
    if (value === '') {
      return null;
    }
    return value;
  } catch (e) {
    return null;
  }
}
export function validateRequired(property: string | undefined, message: string) {
  const error =
    property === '' || property === undefined || property === null ? message : undefined;
  return error;
}

export function convertNumber(value: string) {
  const number = Number(value);
  try {
    if (!isNaN(number)) {
      return number;
    }
    return undefined;
  } catch (e) {
    return undefined;
  }
}

export function formatDate(date: Date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

// @ts-ignore
export function getActiveRouteName(route: any) {
  if (route.state) {
    return getActiveRouteName(route.state.routes[route.state.index]);
  }

  return route.name;
}

// 広告を表示するかどうかの判定をする
// 初回またはADS_DISPLAYの数で割り切れる場合には、true / それ以外はfalse
export function isAdsDisplay(state:number) {
  return state === 0 || state % ADS_DISPLAY == 0
}

export function deleteAccountUrl(url:string,name:string,mailAddress:string,subject:string,message:string){
  return `${url}?name=${name}&mailAddress=${mailAddress}&subject=${subject}&message=${message}`
}
