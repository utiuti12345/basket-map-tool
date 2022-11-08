import * as City from './city';

export function filterAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isAColumn(city));
}

export function filterKAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isKAColumn(city));
}

export function filterSAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isSAColumn(city));
}

export function filterTAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isTAColumn(city));
}

export function filterNAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isNAColumn(city));
}

export function filterHAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isHAColumn(city));
}

export function filterMAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isMAColumn(city));
}

export function filterYAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isYAColumn(city));
}

export function filterRAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isRAColumn(city));
}

export function filterWAColumn(cities: City.City[]): City.City[] {
  return cities.filter((city) => City.isWAColumn(city));
}
