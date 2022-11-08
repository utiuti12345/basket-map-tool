import { Prefecture } from './prefecture';

export interface City {
  city_id: number;
  prefecture_id: number;
  city_name: string;
  city_name_kana: string;
}

export interface CityPrefecture {
  city_id: number;
  city_name: string;
  prefecture: Prefecture;
}

export function isAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ｱ') ||
    city.city_name_kana.startsWith('ｲ') ||
    city.city_name_kana.startsWith('ｳ') ||
    city.city_name_kana.startsWith('ｴ') ||
    city.city_name_kana.startsWith('ｵ')
  );
}

export function isKAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ｶ') ||
    city.city_name_kana.startsWith('ｷ') ||
    city.city_name_kana.startsWith('ｸ') ||
    city.city_name_kana.startsWith('ｹ') ||
    city.city_name_kana.startsWith('ｺ')
  );
}

export function isSAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ｻ') ||
    city.city_name_kana.startsWith('ｼ') ||
    city.city_name_kana.startsWith('ｽ') ||
    city.city_name_kana.startsWith('ｾ') ||
    city.city_name_kana.startsWith('ｿ')
  );
}

export function isTAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ﾀ') ||
    city.city_name_kana.startsWith('ﾁ') ||
    city.city_name_kana.startsWith('ﾂ') ||
    city.city_name_kana.startsWith('ﾃ') ||
    city.city_name_kana.startsWith('ﾄ')
  );
}

export function isNAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ﾅ') ||
    city.city_name_kana.startsWith('ﾆ') ||
    city.city_name_kana.startsWith('ﾇ') ||
    city.city_name_kana.startsWith('ﾈ') ||
    city.city_name_kana.startsWith('ﾉ')
  );
}

export function isHAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ﾊ') ||
    city.city_name_kana.startsWith('ﾋ') ||
    city.city_name_kana.startsWith('ﾌ') ||
    city.city_name_kana.startsWith('ﾍ') ||
    city.city_name_kana.startsWith('ﾎ')
  );
}

export function isMAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ﾏ') ||
    city.city_name_kana.startsWith('ﾐ') ||
    city.city_name_kana.startsWith('ﾑ') ||
    city.city_name_kana.startsWith('ﾒ') ||
    city.city_name_kana.startsWith('ﾓ')
  );
}

export function isYAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ﾔ') ||
    city.city_name_kana.startsWith('ﾕ') ||
    city.city_name_kana.startsWith('ﾖ')
  );
}

export function isRAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ﾗ') ||
    city.city_name_kana.startsWith('ﾘ') ||
    city.city_name_kana.startsWith('ﾙ') ||
    city.city_name_kana.startsWith('ﾚ') ||
    city.city_name_kana.startsWith('ﾛ')
  );
}

export function isWAColumn(city: City): boolean {
  return (
    city.city_name_kana.startsWith('ﾜ') ||
    city.city_name_kana.startsWith('ｦ') ||
    city.city_name_kana.startsWith('ﾝ')
  );
}
